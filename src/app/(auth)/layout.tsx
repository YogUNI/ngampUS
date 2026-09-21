import { AuthAside } from "@/components/auth/auth-form";
import { AuthAnnouncementBanner } from "@/components/auth/auth-announcement-banner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <AuthAnnouncementBanner />
      <main className="grid flex-1 overflow-x-hidden lg:grid-cols-[.9fr_1.1fr]">
        <AuthAside />
        <section className="flex items-center justify-center px-4 py-8 sm:px-8">
          {children}
        </section>
      </main>
    </div>
  );
}

