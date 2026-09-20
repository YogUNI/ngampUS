import { Suspense } from "react";
import { AuthCardFlip } from "@/components/auth/auth-card-flip";

export const metadata = {
  title: "Daftar Akun Baru | ngampUS",
  description: "Buat workspace cerdas untuk menata kuliah, organisasi, dan portofolio CV-mu.",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 animate-pulse rounded-[2rem] bg-white/60" />}>
      <AuthCardFlip initialMode="register" />
    </Suspense>
  );
}
