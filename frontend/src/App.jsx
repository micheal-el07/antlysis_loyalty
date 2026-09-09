import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import ReceiptUpload from "./pages/ReceiptUpload";
import ReceiptHistory from "./pages/ReceiptHistory";
import VoucherList from "./pages/VoucherList";
import AccountSettings from "./pages/AccountSettings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReceipts from "./pages/AdminReceipts";
import AdminVouchers from "./pages/AdminVouchers";
import AdminReceiptReview from "./pages/AdminReceiptReview";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/upload" element={<ReceiptUpload />} />
          <Route path="/history" element={<ReceiptHistory />} />
          <Route path="/vouchers" element={<VoucherList />} />
          <Route path="/settings" element={<AccountSettings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/receipts" element={<AdminReceipts />} />
          <Route path="/admin/vouchers" element={<AdminVouchers />} />
          <Route path="/admin/review" element={<AdminReceiptReview />} />
        </Route>
      </Route>
    </Routes>
  );
}
