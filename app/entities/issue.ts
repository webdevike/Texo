import { z } from "zod";
import { defineEntity } from "../../contracts/entity";

export const issue = defineEntity({
  name: "issue",
  title: "title",
  fields: {
    title: z.string().min(1),
    status: z.enum(["backlog", "todo", "in_progress", "done"]).default("backlog"),
    priority: z.number().int().min(0).max(4).default(0),
    done: z.boolean().default(false),
    notes: z.string().optional(),
  },
});
