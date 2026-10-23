import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatINR(value: number): string {
  if (!value || Number.isNaN(value)) return "Price on request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactPrice(value: number): string {
  if (!value || Number.isNaN(value)) return "Price on request";
  if (value >= 10000000) {
    const cr = value / 10000000;
    return `₹${trimNumber(cr)} Cr`;
  }
  if (value >= 100000) {
    const lakh = value / 100000;
    return `₹${trimNumber(lakh)} Lakh`;
  }
  return formatINR(value);
}

function trimNumber(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatArea(value: number): string {
  if (!value) return "Area on request";
  return `${new Intl.NumberFormat("en-IN").format(value)} sq.ft`;
}

export function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
