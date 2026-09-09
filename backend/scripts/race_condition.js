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
  'b41782f8-7e3a-412d-a920-64f982a69773',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNWU0MDYyNC0zMTE1LTQ3MzEtOGEwMC0zMDFmMWViNzgzOWMiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODg4NjU2NjYsImV4cCI6MTc4OTQ3MDQ2Nn0.CgmNX0bor7XFXDhZ6WB-yu99lRmHDklPzLKVSVs9I7s'
);