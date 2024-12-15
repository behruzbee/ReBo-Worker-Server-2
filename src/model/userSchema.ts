import z from 'zod'

export const userSchema = z.object({
  username: z.string({ required_error: 'Loginni kiriting!' }),
  password: z.string({ required_error: 'Parolni kiriting!' }),
  status_index: z.number({required_error: 'Foydalanuvchi statusini kiriting!'})
})