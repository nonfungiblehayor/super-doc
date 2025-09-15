import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "..";
import { conversationType } from "@/types/session-type";

export const useCreateConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async(conversation: conversationType) => {
           const { data, error } = await supabase.from("conversations") .insert([conversation]).select().single()
           if(error) throw error.message
           if(data) return data
        }
    })
}
export const getConversations = (session_id: string) => 
    useQuery({
        queryKey: ["conversations", session_id],
        queryFn: async() => {
            const { data, error } = await supabase.from("conversations").select("*").eq("session_id", session_id)
            if(error) throw error
            if(data) return data as conversationType[]
        }
    })
export const useUpdateConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async({id, ...convoData}: {id: string} & Partial<conversationType>) => {
            const { data, error } = await supabase.from("conversations").update(convoData).eq("id", id)
            if(error) throw error
            if(data) return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["conversations", variables]
            })
        },
    }) 
}
export const useDeleteConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async(id: string) => {
            const { data, error } = await supabase.from("conversations").delete().eq("id", id)
            if(error) throw error.message
            if(data) return data            
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["conversations", variables]
            })
        },
    })  
}