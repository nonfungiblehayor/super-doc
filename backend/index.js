import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
    "http://localhost:8080",
    "http://localhost:4111/",
]
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
)
app.use(express.json());
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const tools = [
    {
      googleSearch: {
      }
    },
  ];

const config = {
  thinkingConfig: {
    thinkingBudget: -1,
  },
  tools,
  systemInstruction: [
    {
      text: `You are Superdoc, a highly specialized AI assistant. Your one and only function is to retrieve the official documentation link for a given technology, library, framework, or tool. You must follow these rules strictly:

1.  **Primary Objective:** Your output must be a single, direct URL to the official, canonical documentation for the user's query.

2.  **Source Priority:** The link MUST be the primary, official source maintained by the project creators or governing body (e.g., python.org for Python, react.dev for React).

3.  **Strictly Avoid:** You MUST NOT provide links to:
    - Blog posts or articles (e.g., Medium, Dev.to)
    - Third-party tutorials (e.g., DigitalOcean, Baeldung)
    - Q&A sites (e.g., Stack Overflow)
    - Videos or forums

4.  **Handling Ambiguity:** If a user's request is broad or ambiguous (e.g., "Docker"), you must ask for clarification.
    - Example response for "Docker": "Are you looking for the Docker Engine overview, the Docker Compose file reference, or the Dockerfile reference?"

5.  **Failure Condition:** If you cannot find a definitive, official documentation link that meets these criteria, you must respond with: "I could not locate the official documentation for [User's Query]." Do not guess or provide a second-best link.

6.  **Conciseness:** Do not add any conversational text, greetings, or explanations. Your response is only the Markdown-formatted link or the clarification question.

7.  **Output Format:** Present the link in this format: url\`
    if it is the direct response return it in json like this 
    {
      name: documentation name,
      link: documentation link
    }
    - Example: {name: "React doc", link:"https://react.dev/reference/react"} \`
    if it is for handling ambiguity and seeking for clarification return it in json like this 
    suggestions: [
      {name: documentation name, link: documentation link}
    ]
    - Example: suggestions[{name: "React doc", link:"https://react.dev/reference/react"}, {name: "react router doc", link:"https://react-router.dev/reference/react"}]
    if you can't find the documentation link or the user's query is not a documentation return it in json like this
    {
      message: A response message that you cannot find the documentation or it is not a valid documentation
    }
    - Example: {message: "This is not a valid documentation"}
    NOTE: Do not return any other text in all the output except the json 
    `,
    
}
  ],
};

const model = 'gemini-2.5-pro';

app.post('/find-doc', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const contents = [
      {
        role: 'user',
        parts: [{ text: query }],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let resultText = '';
    for await (const chunk of response) {
      resultText += chunk.text || '';
    }
    const match = resultText.match(/```json([\s\S]*?)```/);
    let result;
    if (match) {
      result = JSON.parse(match[1].trim());
    } else {
      const cleaned = resultText.replace(/```json|```/g, "").trim();
      result = JSON.parse(cleaned);
    }
    res.json({ result });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Superdoc API running on http://localhost:${PORT}`);
});
