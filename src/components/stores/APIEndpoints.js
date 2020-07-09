export const baseUrl = 'http://localhost:3000';

let backendHost = 'https://krscode.com/graphql';
let authLoginUrl = 'https://krscode.com/auth/';

const hostname = window && window.location && window.location.hostname;

if (hostname === 'localhost') {
  backendHost = 'http://localhost:8088/graphql';
  authLoginUrl = 'http://localhost:3001/auth';
}

export const teamsUrl = backendHost + "ferris/teams";
export const loginUrl = authLoginUrl;
export const apiHost = backendHost;

