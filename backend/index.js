import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import axios from 'axios';
import puppeteer from 'puppeteer';
import * as cheerio from "cheerio";
import { findAnswer, findDoc, findUrl } from './instructions.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
    "http://localhost:8080",
    "https://superdoc-agent.mastra.cloud/",
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
      result = JSON.parse(match[1].trim());
    } else {
      const cleaned = resultText.replace(/```json|```/g, "").trim();
      result = JSON.parse(cleaned);
    }
    res.json({ result });
  } catch (error) {
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

app.post("/fetch-html", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const html = await fetchHTML(url);
    const links = extractLinks(html);
    res.json(links);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch HTML" });
  }
});

app.post("/use-agent", async(req, res) => {
  const { documentation_url, user_question, links_array} = req.body
  try {
    const response = await fetch(`https://superdoc-agent.mastra.cloud/api/agents/superdocAgent/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
        role: "user", 
        messages: [
          {
            role: "user",
            content: JSON.stringify({ documentation_url, user_question, links_array })
          }
        ]
       }
      )
    })
    if (!response.ok) {
      const raw = await response.text()
      const error = JSON.parse(raw)
      throw new Error(error);
    } 
    if(response.ok) {
      const raw = await response.text()
      const data = JSON.parse(raw)
      const answer = data?.response?.body?.candidates[0]?.content?.parts[0]?.text
      res.json({ answer })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occured try again later" });
  }
})

app.listen(PORT, () => {
  console.log(`Superdoc API running on http://localhost:${PORT}`);
});
