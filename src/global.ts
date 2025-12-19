export function getUserToken() {
  return localStorage.getItem('userToken');
}

export function setUserToken(token: string) {
  localStorage.setItem('userToken', token);
}