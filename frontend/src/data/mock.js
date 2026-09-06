// Mock data standing in for real API responses. Replace with live data wiring later —
// component props and shapes are deliberately kept simple so that swap is mechanical.

export const currentUser = {
  name: "Priya Nandakumar",
  email: "priya.n@example.com",
  memberSince: "March 2024",
  tier: "Gold",
  pointsBalance: 2140,
  pointsToNextTier: 360,
};

export const receipts = [
  {
    id: "RC-1042",
    merchant: "Green Leaf Market",
    date: "2026-09-02",
    amount: 64.18,
    status: "APPROVED",
    points: 128,
    submittedAt: "2026-09-02T14:12:00Z",
  },
  {
    id: "RC-1041",
    merchant: "Ridgeline Outfitters",
    date: "2026-08-29",
    amount: 212.5,
    status: "PENDING",
    points: null,
    submittedAt: "2026-08-29T09:40:00Z",
  },
  {
    id: "RC-1039",
    merchant: "Corner & Co. Coffee",
    date: "2026-08-24",
    amount: 18.75,
    status: "REJECTED",
    points: 0,
    reason: "Image was too blurry to confirm the total. Please retake the photo in good light and resubmit.",
    submittedAt: "2026-08-24T08:05:00Z",
  },
  {
    id: "RC-1035",
    merchant: "Green Leaf Market",
    date: "2026-08-15",
    amount: 41.02,
    status: "APPROVED",
    points: 82,
    submittedAt: "2026-08-15T17:22:00Z",
  },
  {
    id: "RC-1031",
    merchant: "Ridgeline Outfitters",
    date: "2026-08-03",
    amount: 96.4,
    status: "REJECTED",
    points: 0,
    reason: "This receipt was already submitted on 2026-08-03 as RC-1030.",
    submittedAt: "2026-08-03T11:58:00Z",
  },
];

export const vouchers = [
  {
    id: "VC-2201",
    title: "$10 off your next purchase",
    description: "Valid at any participating location.",
    value: "$10.00",
    code: "RALLY-7QK2",
    status: "active",
    expiresAt: "2026-11-01",
  },
  {
    id: "VC-2189",
    title: "Free coffee, on us",
    description: "Redeemable at Corner & Co. Coffee partner cafes.",
    value: "Free item",
    code: "RALLY-9MZP",
    status: "active",
    expiresAt: "2026-09-20",
  },
  {
    id: "VC-2150",
    title: "$5 off your next purchase",
    description: "Valid at any participating location.",
    value: "$5.00",
    code: "RALLY-3FXT",
    status: "redeemed",
    expiresAt: "2026-08-10",
  },
  {
    id: "VC-2098",
    title: "$5 off your next purchase",
    description: "Valid at any participating location.",
    value: "$5.00",
    code: "RALLY-1LWH",
    status: "expired",
    expiresAt: "2026-06-30",
  },
];

export const adminQueue = [
  {
    id: "RC-1041",
    user: "Priya Nandakumar",
    merchant: "Ridgeline Outfitters",
    date: "2026-08-29",
    amount: 212.5,
    status: "PENDING",
    submittedAt: "2026-08-29T09:40:00Z",
  },
  {
    id: "RC-1044",
    user: "Devon Marsh",
    merchant: "Green Leaf Market",
    date: "2026-09-03",
    amount: 27.9,
    status: "PENDING",
    submittedAt: "2026-09-03T16:02:00Z",
  },
  {
    id: "RC-1043",
    user: "Anita Cole",
    merchant: "Summit Hardware",
    date: "2026-09-03",
    amount: 143.2,
    status: "PENDING",
    submittedAt: "2026-09-03T10:15:00Z",
  },
  {
    id: "RC-1040",
    user: "Devon Marsh",
    merchant: "Corner & Co. Coffee",
    date: "2026-08-27",
    amount: 12.4,
    status: "PENDING",
    submittedAt: "2026-08-27T07:50:00Z",
  },
];

export const adminStats = {
  pendingCount: 4,
  approvedToday: 11,
  rejectedToday: 2,
  avgReviewMinutes: 6,
};
