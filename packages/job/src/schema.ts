import { z } from "zod";

export const AtsTypeSchema = z.enum([
  "greenhouse",
  "lever",
  "workday",
  "ashby",
  "generic",
]);

export const JobContextSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  title: z.string(),
  company: z.string(),
  description: z.string(),
  requirements: z.array(z.string()).default([]),
  atsType: AtsTypeSchema,
  rawHtml: z.string().optional(),
  fetchedAt: z.coerce.date(),
});

export type AtsType = z.infer<typeof AtsTypeSchema>;
export type JobContext = z.infer<typeof JobContextSchema>;
