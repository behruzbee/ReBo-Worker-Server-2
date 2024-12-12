import z from 'zod'

export const workerSchema = z.object({
  id: z.string({ required_error: "ID bo'sh bo'lmasligi kerak!" }),
  name: z.string({ required_error: 'Ismni kiritish shart!' }),
  lastName: z.string({ required_error: 'Familyani kiritish shart!' }),
  age: z
    .number({ required_error: 'Yosh kiritish shart!' })
    .int({ message: "Yosh butun son bo'lishi kerak!" })
    .max(50, "Yosh 50 dan katta bo'lmasligi kerak!")
    .positive({ message: "Yosh musbat bo'lishi kerak!" }),
  position: z.string({ required_error: 'Lavozimni kiritish shart!' }),
  hours_to_work: z.string({ message: 'Ish soatini kiritish shart!' }),
  monthly_salary: z
    .number()
    .positive({ message: "Oylik musbat son bo'lishi kerak!" }),
  status_working: z.enum(['working', 'not_working'], {
    required_error: 'Ish holatini kiritish shart!',
    invalid_type_error:
      "Noto'g'ri ish holati, working yoki not_working bo'lishi kerak!"
  }),
  monthly_worked_minutes: z
    .number()
    .int({ message: "Ishlangan minutlar butun son bo'lishi kerak!" })
    .nonnegative({ message: "Ishlangan minutlar manfiy bo'lmasligi kerak!" }),
  qr_code_text: z.string({
    required_error: "QR kod matni bo'sh bo'lmasligi kerak!"
  })
})
