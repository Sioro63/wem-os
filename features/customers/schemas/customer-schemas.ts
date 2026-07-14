import { PriceLevel } from "@prisma/client";
import { z } from "zod";

export const customerFormSchema = z.object({
  company: z.string().min(2, "Enter the company name."),
  contactPerson: z.string().min(2, "Enter the contact person."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(7, "Enter a phone number."),
  address: z.string().min(4, "Enter the address."),
  region: z.string().min(2, "Enter the region."),
  priceLevel: z.nativeEnum(PriceLevel),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type CustomerFormInput = z.infer<typeof customerFormSchema>;
