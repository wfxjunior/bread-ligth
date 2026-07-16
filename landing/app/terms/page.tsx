import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };
export default function Page() {
  return <LegalPage which="terms" />;
}
