let userToken: string | null = null;

export function getUserToken() {
  return userToken;
}

export function setUserToken(token: string | null) {
  userToken = token;
}