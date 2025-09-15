const SUPABASE_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const CLIENT_ID = "285907782489-qnmabid6o6k5h0hqimk7lob1c5u7o8sr.apps.googleusercontent.com";
const REDIRECT_URL = chrome.identity.getRedirectURL("auth/callback");

const OAUTH_URL = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
  REDIRECT_URL
)}`;
chrome.runtime.onInstalled.addListener(() => {
    console.log("Superdoc background script loaded 🚀");
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "DOCS_URL") {
      console.log("Got docs URL from content script:", message.url);
      chrome.storage.local.set({ docsUrl: message.url });
      sendResponse({ status: "ok" });
    }
});
chrome.identity.launchWebAuthFlow(
    {
      url: OAUTH_URL,
      interactive: true,
    },
    (redirectUrl) => {
      if (chrome.runtime.lastError || !redirectUrl) {
        console.error("OAuth failed", chrome.runtime.lastError);
        return;
      }
  
      // redirectUrl will look like:
      // chrome-extension://<id>/auth/callback#access_token=...&refresh_token=...&expires_in=...
      console.log("Redirect URL:", redirectUrl);
  
      // Extract the token fragment
      const params = new URLSearchParams(redirectUrl.split("#")[1]);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
  
      console.log("Access Token:", access_token);
      console.log("Refresh Token:", refresh_token);
  
      // Optional: Store with Supabase client
      // supabase.auth.setSession({ access_token, refresh_token });
    }
  );
  
  