import z from "zod";

export const historySchema = z.object({
  worker_id: z.string({required_error: "Ishchini tanlang!"}),
  work_place_name: z.string({required_error: "Ishlash joyini kiritish shart!"}),
  scan_time: z.string({required_error: "Skanerlanga vaqtni kiritish shart!"}),
  status_type: z.enum(['enter', 'exit'],{required_error: "Ish statusini kiritish shart!"}),
});