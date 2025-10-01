import mixpanel from 'mixpanel-browser';
const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN
 
export const initMixpanel = () => {
  if (!mixpanelToken) {
    console.warn('Mixpanel token is missing! Check your .env file.');
    return;
  }
  mixpanel.init(mixpanelToken, { autocapture: true });
}