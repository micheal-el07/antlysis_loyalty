const axios = require('axios');

async function raceApprove(receiptId, token) {
  const req = () => axios.patch(
    `http://localhost:4000/api/v1/admin/receipts/${receiptId}`,
    { status: 'approved' },
    { headers: { Authorization: `Bearer ${token}` } }
  ).then(r => r.status).catch(e => e.response?.status);

  const [a, b] = await Promise.all([req(), req()]);
  console.log('Request A:', a, '| Request B:', b);
}

raceApprove(
  'receipt ID with pending status',
  'admin JWT token'
);