
let backendHost = 'https://krscode.com/graphql';
let authLoginUrl = 'https://krscode.com/auth/';

const hostname = window && window.location && window.location.hostname;

if (hostname === 'localhost') {
  backendHost = 'http://127.0.0.1:8088/graphql';
  authLoginUrl = 'http://localhost:3001/auth';
}

export const teamsUrl = backendHost + "ferris/teams";
export const loginUrl = authLoginUrl;
export const baseUrl = backendHost;
