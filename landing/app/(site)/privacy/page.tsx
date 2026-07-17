import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };
export default function Page() {
  return <LegalPage which="privacy" />;
}
