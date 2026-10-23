import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Buyer enquiries | Kerala Estates advisor desk",
    template: "%s | Kerala Estates advisor desk",
  },
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminHeader username={session.username} />
      <main>{children}</main>
      <footer className="shell flex flex-col gap-2 border-t border-primary/[0.08] py-6 font-sans text-[10px] text-outline sm:flex-row sm:items-center sm:justify-between">
        <p>Kerala Estates private desk · Confidential buyer information</p>
        <p>Session expires after 8 hours · K-RERA disclosures on request</p>
      </footer>
    </div>
  );
}
