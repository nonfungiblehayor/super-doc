import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { AxiosClient } from '../utils/axios-client';

export const answer_from_doc = createTool({
    id: "answer_from_doc",
    description:`use the documentation_url, links_array and user_question to call the tool`,
    inputSchema: z.object({
        documentation_url: z.string().describe("Documentaion official url"),
        user_question: z.string().describe("user's question"),
        links_array: z.string().describe("Array of links")
    }),    
    execute: async({ context }) => {
    const data =  await getAnswer(context.documentation_url, context.user_question, context.links_array);
        return {
         result: data
        }
    }
})

const getAnswer = async(documentation_url: string, user_question: string, links_array: string) => {
    try {
        const response = await AxiosClient.post("/get-answer-from-docs", { documentation_url, user_question, links_array })
        return response.data;
    } catch (error: any) {
        throw error;
    }
}

