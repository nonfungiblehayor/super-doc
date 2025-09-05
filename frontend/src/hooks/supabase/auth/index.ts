import { supabase } from "..";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_PROJECT_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY
);

export const useGithub = async() => {
    const { data, error} = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
            redirectTo:`${window.location.origin}/`
        }
    })
    if(data) console.log(data)
    if(error) throw error
    if(data) return data
}
export const useGoogle = async() => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo:`${window.location.origin}/`
        }
    })
    if(error) throw error
    if(data) return data
}
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async(user_id: string) => {
            const { error } = await supabaseAdmin.from("user").delete().eq("id", user_id)
            if(error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["users", variables]
            })
        }
    })
}