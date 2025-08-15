import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { AxiosClient } from '../utils/axios-client';

export const find_relevant_page = createTool({
    id: "find_relevant_page",
    description:`use the documentation_url, links_array and user_question to call the tool`,
    inputSchema: z.object({
        documentation_url: z.string().describe("Documentaion official url"),
        user_question: z.string().describe("user's question"),
        links_array: z.string().describe("Array of links")
    }),
    execute: async ({ context }, ) => {
        const data =  await getUrl(context.documentation_url, context.user_question, context.links_array);
        return {
            result: data
        }
    },
})
const getUrl = async(documentation_url: string, user_question: string, links_array: string) => {
    try {
        const response = await AxiosClient.post("/find-url", { documentation_url, user_question, links_array })
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


export const answer_from_page = createTool({
    id: "answer_from_page",
    description: "use the specifi_page_url and user_question to call the tool",
    inputSchema: z.object({
        specific_page_url: z.string().describe("Specific page url"),
        user_question: z.string().describe("User's question")
    }),
    execute: async({ context }) => {
        const data = await getAnswer(context.specific_page_url, context.user_question)
        return {
            result: data
        }
    }
})
const getAnswer = async(specific_page_url: string, user_question: string) => {
    try {
        const response = await AxiosClient.post("/answer-from-url", { specific_page_url, user_question })
        return response.data;
    } catch (error: any) {
        throw error;
    }
}