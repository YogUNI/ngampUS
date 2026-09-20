import { AuthAside } from "@/components/auth/auth-form";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid h-screen overflow-hidden bg-[var(--background)] lg:grid-cols-[.9fr_1.1fr]">
      <AuthAside />
      <section className="flex items-center justify-center overflow-y-auto px-4 py-4 sm:px-8">
        {children}
      </section>
    </main>
  );
}
