import z from "zod";

export const HmpactBuildInfoSchema = z.object({
  version: z.string(),
  buildId: z.string(),
  commit: z.string(),
  branch: z.string(),
  timestamp: z.string(),
});
export type HmpactBuildInfoType = z.infer<typeof HmpactBuildInfoSchema>;
