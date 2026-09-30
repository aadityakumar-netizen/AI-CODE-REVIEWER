import request from './api';
export function getGitHubRepository(url){ return request(`/github/repository?url=${encodeURIComponent(url)}`); }
