import { z } from "zod";

export const taskSchema = z.object({
  id: z.string({ required_error: "ID is required!" }).uuid("ID must be a valid UUID!"), // Unique task identifier
  store_name: z.string({ required_error: "Store name is required!" }).min(1, "Store name cannot be empty!"), // Store or location of the task
  description: z.string({ required_error: "Description is required!" }).min(1, "Description cannot be empty!"), // Task description
  completed_by: z
    .string()
    .optional()
    .or(z.literal("")), // Worker who completed the task (can be empty or optional)
  completed_at: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: "Completed date must be a valid ISO timestamp!",
    }), // Completion timestamp
  created_at: z
    .string({ required_error: "Creation timestamp is required!" })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Created date must be a valid ISO timestamp!",
    }), // Task creation timestamp
  status: z.enum(["pending", "completed"], {
    required_error: "Status is required!",
  }), // Task status (pending or completed)
});
