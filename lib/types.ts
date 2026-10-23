export type EnquiryStatus = "New" | "Contacted" | "Interested" | "Closed";

export const ENQUIRY_STATUSES: EnquiryStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Closed",
];

export type Property = {
  id: string;
  name: string;
  city: string;
  district: string;
  landmark: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  propertyType: string;
  imageUrl: string;
  gallery: string[];
  keyFeatures: string[];
  description: string;
  status: string;
  featured: boolean;
  premium: boolean;
  reraVerified: boolean;
  createdAt: string;
};

export type Enquiry = {
  id: string;
  buyerName: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyName?: string;
  preferredLocation: string;
  budget: string;
  propertyType: string;
  bedrooms: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  source: "website" | "admin" | "sample";
};

export type EnquiryInput = {
  buyerName: string;
  phone: string;
  email?: string;
  propertyId?: string;
  /** Resolved server-side from the catalogue; never trusted from the client. */
  propertyName?: string;
  preferredLocation?: string;
  budget?: string;
  propertyType?: string;
  bedrooms?: string;
  message?: string;
};

export type DataSource = "apps-script" | "mock";

export type PropertiesResult = {
  items: Property[];
  source: DataSource;
  warning?: string;
};

export type EnquiriesResult = {
  items: Enquiry[];
  source: DataSource;
  warning?: string;
};

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = {
  ok: false;
  error: { code: string; message: string; fields?: Record<string, string> };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PropertyFilters = {
  q: string;
  city: string;
  district: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  minPrice: string;
  maxPrice: string;
  sort: "newest" | "price-asc" | "price-desc" | "area-desc" | "area-asc";
};
