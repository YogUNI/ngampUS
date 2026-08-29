import { AuthAside } from "@/components/auth/auth-form";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen bg-[#f7f8f5] lg:grid-cols-[.9fr_1.1fr]"><AuthAside/><section className="flex items-center justify-center px-5 py-12 sm:px-8">{children}</section></main>;
}
