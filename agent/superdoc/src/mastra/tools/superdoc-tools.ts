import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { AxiosClient } from '../utils/axios-client';

let link = {}
export const answer_from_doc = createTool({
    id: "answer_from_doc",
    description:`use the documentation_url, links_array and user_question to call the tool`,
    inputSchema: z.object({
        documentation_url: z.string().describe("Documentaion official url"),
        user_question: z.string().describe("user's question")
    }),    
    execute: async({ context }) => {
    const data =  await getAnswer(context.documentation_url, context.user_question, link)
        return {
            result: data
        }
    }
})

export const crawl_docs = createTool({
    id: "crawl_docs",
    description: `use the documentation url to call the tool`,
    inputSchema: z.object({
        url: z.string()
    }),
    execute: async({ context }) => {
        const data = await getLinks(context.url)
        link = data
        return {
            result: data
        }
    }
})

const getLinks = async(url: string) => {
    try {
        const response = await AxiosClient.post("/fetch-html", { url })
        return response.data;
    } catch (error) {
        throw error;
    }
}

const getAnswer = async(documentation_url: string, user_question: string, links_array: any) => {
    try {
        const response = await AxiosClient.post("/get-answer-from-docs-agent", { documentation_url, user_question, links_array })
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

