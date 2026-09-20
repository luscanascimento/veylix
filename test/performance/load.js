import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users
    { duration: '1m', target: 20 },  // Maintain 20 users
    { duration: '30s', target: 0 },  // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be strictly less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000/api';

export default function () {
  // We hit the health endpoint which represents the unauthenticated read path
  const res = http.get(`${BASE_URL}/health/readiness`);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
    'is status ok': (r) => r.json('status') === 'ok',
  });

  sleep(1);
}
