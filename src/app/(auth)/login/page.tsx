import { Suspense } from "react";
import { AuthCardFlip } from "@/components/auth/auth-card-flip";

export const metadata = {
  title: "Masuk ke Workspace | ngampUS",
  description: "Masuk untuk melihat jadwal kuliah, deadline tugas, dan ritme organisasimu.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 animate-pulse rounded-[2rem] bg-white/60" />}>
      <AuthCardFlip initialMode="login" />
    </Suspense>
  );
}
