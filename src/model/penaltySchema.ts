import z from 'zod'

export const penaltySchema = z.object({
  worker_id: z.string({ required_error: 'Ishchini tanlang!' }),
  description: z.string({ required_error: 'Sababni kiritish shart!' }),
  amount: z.number({
    required_error: 'Miqdorni kiritish shart',
    invalid_type_error: "Son bo'lishi kerak!"
  })
})
