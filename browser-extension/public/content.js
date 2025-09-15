chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg === "getPageUrl") {
      sendResponse({ url: window.location.href });
    }
  });
  