import { WHATSAPP_NUMBER } from "./constants";

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function buildWhatsAppUrl({
  phone,
  message,
}: {
  phone?: string;
  message: string;
}): string {
  const digits = normalizePhone(phone || WHATSAPP_NUMBER);
  const withCountry =
    digits.length === 10 ? `91${digits}` : digits.startsWith("0") ? `91${digits.slice(1)}` : digits;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}

export function propertyWhatsAppMessage(name: string, id: string, location?: string) {
  return `Hello Kerala Estates, I am interested in ${name} (Ref: ${id})${
    location ? ` in ${location}` : ""
  }. Please share availability, the floor plan and a private viewing slot.`;
}

export function telHref(phone: string): string {
  const digits = normalizePhone(phone);
  return `tel:+${digits.length === 10 ? `91${digits}` : digits}`;
}
