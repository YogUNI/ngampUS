import { AuthAside } from "@/components/auth/auth-form";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[.9fr_1.1fr]"><AuthAside/><section className="flex items-center justify-center px-5 py-12 sm:px-8 [&>div]:rounded-3xl [&>div]:border [&>div]:border-[var(--line)] [&>div]:bg-white/75 [&>div]:p-6 [&>div]:shadow-2xl [&>div]:shadow-[#10261b]/[.06] sm:[&>div]:p-8">{children}</section></main>;
}
