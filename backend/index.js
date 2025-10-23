import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import axios from 'axios';
import puppeteer from 'puppeteer';
import * as cheerio from "cheerio";
import { findAnswer, findDoc, findUrl, transcribeAudio } from './instructions.js';
import JSON5 from "json5";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
    "https://superdoc-ai.vercel.app",
    "http://localhost:8080",
    "https://superdoc-agent.mastra.cloud",
    "chrome-extension://ippmhdllaoencfelhogbbkmnnhhenchj",
    "vscode-webview://" 
]
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS")); 
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200 // for some legacy browsers
// };
const corsOptions = {
  origin: function (origin, callback) {
    // Always allow your trusted origins
    if (!origin) {
      // Explicitly allow your main site when no origin is sent (curl, SSR, etc.)
      return callback(null, "https://superdoc-ai.vercel.app");
    }

    if (allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.options(/.*/, cors(corsOptions));
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const upload = multer({ storage: multer.memoryStorage() });
const model = 'gemini-2.5-pro';
async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      timeout: 10000,
    });

    if (isLikelyDynamic(data)) {
      console.log("⚠ Detected dynamic page, switching to Puppeteer...");
      return await fetchWithPuppeteer(url);
    }

    console.log("✅ Fetched with Axios");
    return data;

  } catch (error) {
    console.log("❌ Axios failed, using Puppeteer...");
    return await fetchWithPuppeteer(url);
  }
}

function isLikelyDynamic(html) {
  const bodyContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").trim();
  return bodyContent.length < 200;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function fetchWithPuppeteer(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/120.0.0.0 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 })
    await page.waitForSelector("main, article, nav, .DocContainer", { timeout: 30000 })
    await new Promise(resolve => setTimeout(resolve, 3000))
    await autoScroll(page)
    const content = await page.content()
    return content;
  } catch (err) {
    throw err
  } finally {
    await browser.close();
  }
}

function extractLinks(html) {
  const $ = cheerio.load(html);
  const links = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    if (href) {
      links.push({ href, text });
    }
  });

  return links;
}

app.post('/find-doc', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
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
          text: `${findDoc}`, 
        }
      ],
    };
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
      result = JSON5.parse(match[1].trim());
    } else {
      if(resultText !== "") {
        const cleaned = resultText.replace(/```json|```/g, "").trim()
        result = JSON5.parse(cleaned);
      } else {
        result = null
      }
    }
    res.json({ result });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/find-url", async (req, res) => {
  try {
    const { documentation_url, user_question, links_array } = req.body;
    if(!user_question) {
      return res.status(400).json({ error: "User question is required" });
    }
    if (!documentation_url) {
      return res.status(400).json({ error: "Documentation url is required" });
    }
    const config = {
      systemInstruction: [{ text: `${findUrl}`}],
    };
    const contents = [{
      role: "user",
      parts: [{ 
        text: `link_arrays: ${JSON.stringify(links_array, null, 2)}\n\nuser_question: "${user_question}"\n\ndocumentation_url: "${documentation_url}"` 
      }],
    }];

    const responseStream = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullTextResponse = "";
    for await (const chunk of responseStream) {
      const parts = chunk?.candidates?.[0]?.content?.parts;
      if (!parts) {
        continue; 
      }
      for (const part of parts) {
        if (part.text) {
          console.log("Found text chunk:", part.text);
          fullTextResponse += part.text;
        }
      }
    }
    if (fullTextResponse) {
      return res.json({ result: fullTextResponse });
    }
    return res.json({ result: "", message: "Model finished without returning any content." });

  } catch (error) {
    res.status(500).json({ error: "Something went wrong", message: error.message });
  }
});

app.post("/answer-from-url", async (req, res) => {
  try {
    const { specific_page_url, user_question } = req.body;
    if (!user_question || !specific_page_url) {
      return res.status(400).json({ error: "User question and page url are required" });
    }
    const config = {
      tools: [{ urlContext: {} }],
      systemInstruction: [{ text: findAnswer }],
    };
    const userPrompt = `Using the content from the URL ${specific_page_url}, please answer the following question: "${user_question}"`;
    const contents = [{
      role: "user",
      parts: [{ text: userPrompt }],
    }];
    const responseStream = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });
    let fullTextResponse = "";
    for await (const chunk of responseStream) {
      const parts = chunk?.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      
      for (const part of parts) {
        if (part.text) {
          fullTextResponse += part.text;
        }
      }
    }
    if (fullTextResponse) {
      return res.json({ result: fullTextResponse });
    }
    return res.json({ result: "", message: "Model finished without returning any content." });

  } catch (error) {
    console.error("Error generating content:", error);
    if (error.message.includes('permission')) {
      console.error("This could be a permissions issue with the URL or API key.")
    }
    res.status(500).json({ error: "Something went wrong", message: error.message });
  }
});

// app.post("/fetch-html", async (req, res) => {
//   const { url } = req.body;

//   if (!url) {
//     return res.status(400).json({ error: "Missing url parameter" });
//   }

//   try {
//     const html = await fetchHTML(url);
//     const links = extractLinks(html);
//     res.json(links);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch HTML" });
//   }
// });

app.post("/fetch-html", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid url parameter" });
  }

  // Prevent recursion (your own backend calling itself)
  if (url.startsWith("https://ap-super-doc.onrender.com")) {
    return res.status(400).json({ error: "Recursive fetch blocked" });
  }

  try {
    // Limit the HTML download to ~1MB to avoid memory issues
    const response = await axios.get(url, {
      timeout: 8000,
      maxContentLength: 1 * 1024 * 1024, // 1 MB
      headers: { "User-Agent": "SuperDocBot/1.0" },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter(Boolean);
    res.json({ links });
  } catch (error) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch or parse HTML" });
  }
});

app.post("/get-answer-from-docs", async (req, res) => {
  try {
    const { documentation_url, user_question, links_array } = req.body;
    if (!user_question || !documentation_url) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: "User question and documentation url are required" })}\n\n`);
      return res.end();
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    //res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
    res.flushHeaders();

    const send = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    send("log", { message: "Step 1: Finding the relevant URL..." });

    const findUrlContents = [{
      role: "user",
      parts: [{ 
        text: `link_arrays: ${JSON.stringify(links_array, null, 2)}\n\nuser_question: "${user_question}"\n\ndocumentation_url: "${documentation_url}"` 
      }],
    }];

    const findUrlResponse = await ai.models.generateContent({
      model,
      config: { systemInstruction: [{ text: `${findUrl}` }] },
      contents: findUrlContents,
    });

    const specific_page_url = findUrlResponse?.candidates[0].content.parts[0].text.trim();

    if (!specific_page_url) {
      send("error", { message: "Model failed to find a specific URL." });
      return res.end();
    }

    send("log", { message: `Step 1 complete. Found URL: ${specific_page_url}` });

    await new Promise(resolve => setTimeout(resolve, 31000)); // rate limit

    send("log", { message: "Step 2: Generating answer from the URL..." });

    const answerContents = [{
      role: "user",
      parts: [{ text: `Using the content from the URL ${specific_page_url}, please answer the following question: "${user_question}"` }],
    }];

    const responseStream = await ai.models.generateContentStream({
      model,
      config: { tools: [{ urlContext: {} }], systemInstruction: [{ text: findAnswer }] },
      contents: answerContents,
    });

    for await (const chunk of responseStream) {
      const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) send("answer", { text });
    }

    send("done", { message: "Completed." });
    res.end();

  } catch (error) {
    console.error("Error in combined endpoint:", error);
    if (!res.headersSent) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    } else {
      throw error
    }
  }
});

app.post("/get-answer-from-docs-agent", async (req, res) => {
  try {
    const { documentation_url, user_question, links_array } = req.body;

    if (!user_question || !documentation_url) {
      return res.status(400).json({ message: "User question and documentation url are required" });
    }

    const findUrlContents = [{
      role: "user",
      parts: [{ 
        text: `link_arrays: ${JSON.stringify(links_array, null, 2)}\n\nuser_question: "${user_question}"\n\ndocumentation_url: "${documentation_url}"` 
      }],
    }];

    const findUrlResponse = await ai.models.generateContent({
      model,
      config: { systemInstruction: [{ text: `${findUrl}` }] },
      contents: findUrlContents,
    });

    const specific_page_url = findUrlResponse?.candidates[0]?.content.parts[0]?.text.trim();
    if (!specific_page_url) {
      return res.status(404).json({ message: "Could not determine specific page URL" });
    }

    // Optional rate limit
    await new Promise(resolve => setTimeout(resolve, 31000));

    const answerContents = [{
      role: "user",
      parts: [{ text: `Using the content from the URL ${specific_page_url}, please answer the following question: "${user_question}"` }],
    }];

    const responseStream = await ai.models.generateContentStream({
      model,
      config: { tools: [{ urlContext: {} }], systemInstruction: [{ text: findAnswer }] },
      contents: answerContents,
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) fullText += text;
    }

    return res.json({ text: fullText });

  } catch (error) {
    console.error("Error in combined endpoint:", error);
    return res.status(500).json({ message: error.message });
  }
});


app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    const audioBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const config = {
      thinkingConfig: { thinkingBudget: -1 },
      systemInstruction: [{ text: transcribeAudio }],
    };

    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: { data: audioBase64, mimeType },
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let transcription = '';
    for await (const chunk of response) {
      transcription += chunk.text;
    }

    res.json({ transcription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});


app.listen(PORT, () => {
  console.log(`Superdoc API running on http://localhost:${PORT}`);
});
