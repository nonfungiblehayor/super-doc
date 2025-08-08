import { supabase } from "..";

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
    if(data) console.log(data)
    if(error) throw error
    if(data) return data
}