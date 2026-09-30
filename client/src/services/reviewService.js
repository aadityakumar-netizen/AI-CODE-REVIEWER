import request from './api';

export function createReview(data) {
  return request('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getReviews() {
  return request('/reviews');
}

export function getReviewById(id) {
  return request(`/reviews/${id}`);
}

export function deleteReview(id) {
  return request(`/reviews/${id}`, {
    method: 'DELETE',
  });
}