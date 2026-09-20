import { AuthAside } from "@/components/auth/auth-form";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-[var(--background)] lg:grid-cols-[.9fr_1.1fr]">
      <AuthAside />
      <section className="flex items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        {children}
      </section>
    </main>
  );
}
