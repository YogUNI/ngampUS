import { getWebAnalyticsData } from "@/lib/web-telemetry";
import { WebAnalyticsClient } from "./web-analytics-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Live Web Traffic & Hosting Analytics | ngampUS Admin",
  description: "Pemantauan statistik kunjungan website ngampus.site, rute terpopuler, rasio perangkat, dan kesehatan server hosting secara real-time.",
};

export default async function AdminWebAnalyticsPage() {
  const initialAnalytics = await getWebAnalyticsData(7);

  return <WebAnalyticsClient initialAnalytics={initialAnalytics} />;
}
