import z from 'zod'

export const authSchema = z.object({
  username: z.string({ required_error: 'Loginni kiriting!' }),
  password: z.string({ required_error: 'Parolni kiriting!' })
})
