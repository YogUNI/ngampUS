import { getSystemFlags } from "@/lib/system-settings";
import { SystemControlsClient } from "./system-controls-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Controls & Feature Flags | ngampUS Admin",
  description: "Pusat saklar kendali sistem, emergency maintenance, dan fitur killswitch.",
};

export default async function AdminSystemControlsPage() {
  const flags = await getSystemFlags();

  return <SystemControlsClient initialFlags={flags} />;
}
