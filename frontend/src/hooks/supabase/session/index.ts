import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "..";
import { sessionServer } from "@/types/session-type";

export const useCreateSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async(newSession: sessionServer) => {
            const { data ,error } = await supabase.from("sessions").insert([newSession]).select().single()
            if(error) throw error.message
            if(data) return data
        }
    })
}
export const getSession = (session_id: string, user_id: string) => 
    useQuery({
        queryKey: ["sessions", session_id],
        queryFn: async() => {
            const { data, error } = await supabase.from("sessions").select("*").eq("id", session_id).eq("user_id", user_id).single()
            if(error) throw error
            if(data) return data
        }
    })
export const getSessions = (user_id: string) => 
    useQuery({
        queryKey: ["sessions", user_id],
        queryFn: async() => {
            const { data, error } = await supabase.from("sessions").select("*").eq("user_id", user_id).order("created_at", {ascending: false})
            if(error) throw error
            if(data) return data as sessionServer[]
        }
    })