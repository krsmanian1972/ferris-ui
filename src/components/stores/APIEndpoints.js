let uiUrl = 'https://krscode.com';
let backendHost = 'https://krscode.com';
let authLoginUrl = 'https://krscode.com/auth/';
const hostname = window && window.location && window.location.hostname;

if (hostname === 'localhost') {
  backendHost = 'http://localhost:8088';
  authLoginUrl = 'http://localhost:3001/auth';
  uiUrl = 'http://localhost:3000/'
}


export const backendUrl = backendHost;
export const loginUrl = authLoginUrl;

export const apiHost = backendHost+"/graphql";
export const assetHost = backendHost+"/assets";

export const baseUrl = uiUrl;

