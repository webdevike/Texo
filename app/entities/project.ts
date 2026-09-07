import { z } from "zod";
import { defineEntity } from "../../contracts/entity";

export const project = defineEntity({
  name: "project",
  title: "name",
  fields: {
    name: z.string().min(1),
    lead: z.string().optional(),
    stage: z.enum(["planned", "active", "paused", "shipped"]).default("planned"),
    health: z.number().int().min(0).max(100).default(100),
  },
});
