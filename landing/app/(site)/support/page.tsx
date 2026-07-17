import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
export const metadata: Metadata = { title: "Support", alternates: { canonical: "/support" } };
export default function Page() {
  return <LegalPage which="support" />;
}
