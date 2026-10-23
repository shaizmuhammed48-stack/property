import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getEnquiries } from "@/lib/enquiries";
import { getProperties } from "@/lib/properties";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buyer enquiries",
  robots: { index: false, follow: false },
};

export default async function AdminEnquiriesPage() {
  const [{ items: enquiries, source, warning }, { items: properties }] = await Promise.all([
    getEnquiries(),
    getProperties(),
  ]);

  const propertyOptions = properties.map((property) => ({
    id: property.id,
    name: property.name,
    city: property.city,
    price: property.price,
    propertyType: property.propertyType,
  }));

  return (
    <AdminDashboard
      initialEnquiries={enquiries}
      properties={propertyOptions}
      source={source}
      warning={warning}
    />
  );
}
