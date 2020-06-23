
let backendHost = 'https://krscode.com/';
let authLoginUrl = 'https://krscode.com/auth/';

const hostname = window && window.location && window.location.hostname;

if (hostname === 'localhost') {
  backendHost = 'http://localhost:3000/';
  authLoginUrl = 'http://localhost:3001/auth';
}

export const teamsUrl = backendHost + "ferris/teams";
export const loginUrl = authLoginUrl;
export const baseUrl = backendHost;
