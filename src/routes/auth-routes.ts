import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { v4 as uuidV4 } from 'uuid'
import jwt from 'jsonwebtoken'

import UserService from '../service/users-service.js'
import { authSchema } from '../model/authSchema.js'
import { userSchema } from '../model/userSchema.js'
import { IUser } from '../types/user-type.js'

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

    const token = jwt.sign(user, process.env.JWT_SECRET_KEY || '', { expiresIn: '1h' })
    return res.status(201).json({ token })
  } catch (error) {
    res.status(500).json({ error: 'Failed to login user' })
  }
})

// @ts-ignore
router.post('/sign-up', (req: Request, res: Response) => {
  try {
    const newUser: IUser = req.body
    const result = userSchema.safeParse(newUser)
    if (!result.success)
      return res.status(400).json({ errors: result.error.errors })

    const user = userService.getUserByUsername(newUser.username)
    if (user) {
      return res
        .status(403)
        .json({ error: "username ishlatilgan!" })
    }

    const hashPassword = bcrypt.hashSync(newUser.password, 10)

    const preparedUser: IUser = {
      id: uuidV4(),
      username: newUser.username,
      password: hashPassword,
      status_index: newUser.status_index,
      created_at: new Date().toISOString()
    }
    userService.addUser(preparedUser)
    const token = jwt.sign(preparedUser, process.env.JWT_SECRET_KEY || '', { expiresIn: '1h' })
    return res.status(201).json({ token })
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign-up user' })
  }
})

export default router
