import request from './api';

export function registerUser(email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function loginUser(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function getCurrentUser() {
  return request('/auth/me');
}