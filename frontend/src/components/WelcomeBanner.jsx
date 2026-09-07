import { Link } from "react-router-dom";
import Button from "./Button";

export default function WelcomeBanner({ name }) {
  const firstName = name.split(" ")[0];

  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-ink/60">
          Every receipt you upload unlock a new exciting voucher.
        </p>
      </div>
      <Button as={Link} to="/upload" variant="brass">
        Upload a receipt
      </Button>
    </div>
  );
}
