export const SITE_NAME = "Kerala Estates";
export const SITE_TAGLINE = "Private Residence Index";
export const SITE_DESCRIPTION =
  "Curated waterfront estates, city residences and backwater retreats across Kerala. A private residence index for discerning buyers and NRI investors.";

export const OFFICE_PHONE = process.env.NEXT_PUBLIC_OFFICE_PHONE || "+91 484 290 8000";
export const OFFICE_PHONE_E164 =
  process.env.NEXT_PUBLIC_OFFICE_PHONE_E164 || "914842908000";
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919847012345";

export const PROPERTIES_PER_PAGE = 6;

export const CITIES = [
  "Kochi",
  "Alappuzha",
  "Trivandrum",
  "Thrissur",
  "Calicut",
] as const;

export const DISTRICTS = [
  "Ernakulam",
  "Alappuzha",
  "Thiruvananthapuram",
  "Thrissur",
  "Kozhikode",
  "Kottayam",
  "Kollam",
  "Kannur",
  "Malappuram",
  "Palakkad",
  "Wayanad",
  "Idukki",
  "Pathanamthitta",
  "Kasaragod",
] as const;

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Penthouse",
  "Estate",
  "Plot",
] as const;

export const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"] as const;

export const PRICE_BANDS = [
  { label: "Any budget", min: "", max: "" },
  { label: "Under ₹50 Lakh", min: "", max: "5000000" },
  { label: "₹50L – ₹75L", min: "5000000", max: "7500000" },
  { label: "₹75L – ₹1 Cr", min: "7500000", max: "10000000" },
  { label: "Above ₹1 Cr", min: "10000000", max: "" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Residences" },
  { href: "/properties?sort=price-desc", label: "Signature Collection" },
  { href: "/enquiry", label: "Private Enquiry" },
] as const;
