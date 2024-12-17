import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import UserService from '../service/users-service.js'
import { authSchema } from '../model/authSchema.js'

const router = Router()
const userService = new UserService('./users.json')

// @ts-ignore
router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    const result = authSchema.safeParse({ username, password })
    if (!result.success)
      return res.status(400).json({ errors: result.error.errors })

    const user = userService.getUserByUsername(username)
    if (!user)
      return res
        .status(403)
        .json({ error: "username yoki password noto'g'ri!" })

    const match = bcrypt.compareSync(password, user.password)
    if (!match)
      return res
        .status(403)
        .json({ error: "username yoki password noto'g'ri!" })

    const token = jwt.sign(user, process.env.JWT_SECRET_KEY || '', { expiresIn: '3h' })
    return res.status(201).json({ token })
  } catch (error) {
    res.status(500).json({ error: 'Failed to login user' })
  }
})

export default router
