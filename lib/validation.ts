import { z } from "zod";
import { ENQUIRY_STATUSES } from "./types";

const asString = (value: unknown) =>
  typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);

const requiredText = (label: string, max: number) =>
  z.preprocess(
    asString,
    z
      .string()
      .trim()
      .min(1, `${label} is required.`)
      .max(max, `${label} must be under ${max} characters.`)
  );

const optionalText = (max: number) =>
  z.preprocess(asString, z.string().trim().max(max, `Please keep this under ${max} characters.`));

export const enquirySchema = z.object({
  buyerName: requiredText("Full name", 80),
  phone: z.preprocess(
    asString,
    z
      .string()
      .trim()
      .min(1, "Phone number is required.")
      .max(24, "Phone number is too long.")
      .refine((value) => {
        const digits = value.replace(/[^\d]/g, "");
        return digits.length >= 10 && digits.length <= 15;
      }, "Enter a valid phone number with 10–15 digits.")
  ),
  email: z.preprocess(
    asString,
    z
      .string()
      .trim()
      .max(160)
      .refine(
        (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Enter a valid email address."
      )
  ),
  propertyId: optionalText(64),
  preferredLocation: optionalText(120),
  budget: optionalText(60),
  propertyType: optionalText(60),
  bedrooms: optionalText(20),
  message: optionalText(1200),
});

export const adminLoginSchema = z.object({
  username: requiredText("Username", 80),
  password: requiredText("Password", 200),
});

export const updateStatusSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES as [string, ...string[]]),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const flattened = error.flatten();
  const result: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
    if (messages && messages.length > 0) result[key] = messages[0];
  }
  if (flattened.formErrors.length > 0) result._form = flattened.formErrors[0];
  return result;
}
