
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
// Using the same model identifier as the backend. 
// If this is a custom model or typo, it might need adjustment (e.g. "gemini-1.5-pro").
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const findUrlPrompt = `
You are an AI assistant designed to function as a specialized search engine. Your sole purpose is to find the single most relevant URL that answers a user's question, based on a provided JSON array of link objects (link_arrays) and a base_url.
Your operational rules are as follows:
1.  **Strict Data Scoping:** You must operate exclusively on the 'link_arrays', 'user_question', and 'base_url' provided in the prompt. You are forbidden from using any external knowledge.
2.  **Keyword Analysis:** Analyze the 'user_question' to extract the most specific and important keywords. For "how can i use mastra in next js", the key terms are "next js".
3.  **Targeted Search:** Search through both the 'href' and 'text' fields of every object within the 'link_arrays'. Your goal is to find the object that contains the most direct and specific match for the keywords. A match in the 'text' field like "With Next.js" is a very strong signal.
4.  **No Guessing:** If no link directly and clearly addresses the user's question, you must state that you cannot find a relevant answer within the provided data.
5.  **URL Construction:** Once the most relevant link object is identified, construct the final, absolute URL by combining the provided 'base_url' with the 'href' value from the selected object.
6.  **Output Format:** Your final output must contain only the single, fully constructed URL and nothing else.
`;

const findAnswerPrompt = `
You are an AI Documentation Expert. Your sole purpose is to provide a clear and accurate answer to a user's question.
- You will be given a user question and a URL.
- The system will automatically provide you with the relevant content from that URL.
- Your answer MUST be based EXCLUSIVELY on the provided content.
- Do not use any external knowledge.
- If the answer is not present in the content, you MUST respond with the exact phrase: "I could not find a specific answer to your question on the provided page."
`;

interface Link {
    href: string;
    text: string;
}

interface GetAnswerProps {
    documentation_url: string;
    user_question: string;
    links_array: Link[];
    onLog?: (message: string) => void;
}

const transcribeAudioPrompt = `### ROLE ###
You are a silent, high-accuracy transcription engine.

### MISSION ###
Your mission is to convert a single audio utterance from a user into a perfectly formatted, clean text string. You will operate with maximum efficiency and precision.

### CORE DIRECTIVES ###

1.  **Output Format: Direct & Raw Text**
    *   Your entire response MUST be the transcribed text and nothing else.
    *   Do not under any circumstances begin your response with "Here is the text:", "You said:", or any other preamble.
    *   Do not add any text after the transcription.

2.  **Transcription Style: Strict Clean Read**
    *   Aggressively remove all non-essential speech artifacts. This includes filler words ("um", "uh", "hmm"), stutters, and self-corrections ("I meant...").
    *   The goal is to capture the user's final intended question or statement as if they had typed it perfectly.

3.  **Formatting**
    *   Use proper capitalization and punctuation to reflect the grammar and intent of the spoken words. A question must end with a question mark.

4.  **Error Handling**
    *   If a word is unintelligible, use "[inaudible]".

### FORBIDDEN ACTIONS ###
*   You will NOT use speaker labels (e.g., 'Speaker 1').
*   You will NOT use timestamps.
*   You will NOT engage in conversation or add commentary.

### EXAMPLE ###
*   IF THE USER'S AUDIO SAYS: "Okay, so, like, what's the, uh, what's the weather like in Paris today?"
*   YOUR CORRECT OUTPUT IS: 'What's the weather like in Paris today?
*   ANY OTHER RESPONSE IS A FAILURE.`;

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY.");
    }

    const reader = new FileReader();
    const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data:audio/webm;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
    });

    const result = await model.generateContent({
        contents: [{
            role: "user",
            parts: [
                { text: transcribeAudioPrompt },
                {
                    inlineData: {
                        mimeType: audioBlob.type || "audio/webm",
                        data: base64Audio
                    }
                }
            ]
        }]
    });

    return result.response.text().trim();
}

export async function getAnswerFromDocs({
    documentation_url,
    user_question,
    links_array,
    onLog
}: GetAnswerProps): Promise<AsyncGenerator<string, void, unknown>> {

    if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY.");
    }

    // Step 1: Find the URL
    if (onLog) onLog("Step 1: Finding the relevant URL...");

    const findUrlContents = [{
        role: "user",
        parts: [{
            text: `link_arrays: ${JSON.stringify(links_array, null, 2)}\n\nuser_question: "${user_question}"\n\ndocumentation_url: "${documentation_url}"`
        }],
    }];

    const findUrlResult = await model.generateContent({
        contents: findUrlContents,
        systemInstruction: findUrlPrompt,
    });

    const specific_page_url = findUrlResult.response.text().trim();

    if (!specific_page_url) {
        throw new Error("Model failed to find a specific URL.");
    }

    if (onLog) onLog(`Step 1 complete. Found URL: ${specific_page_url}`);

    if (onLog) onLog("Step 2: Generating answer from the URL...");

    const answerContents = [{
        role: "user",
        parts: [{ text: `Using the content from the URL ${specific_page_url}, please answer the following question: "${user_question}"` }],
    }];

    // Let's return the stream directly from the generator.
    return (async function* () {
        const result = await model.generateContentStream({
            contents: answerContents,
            systemInstruction: findAnswerPrompt,
            // @ts-ignore
            tools: [{ urlContext: {} }] // Fallback to googleSearch if urlContext isn't directly exposed
        });

        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) yield text;
        }
    })();
}
