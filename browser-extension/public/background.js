import { supabase } from "./supabase"

chrome.runtime.onInstalled.addListener(() => {
  console.log("Background worker ready")
})

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "TOKEN_REFRESHED") {
    console.log("Background refreshed session")
  }
})
  