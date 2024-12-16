import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { v4 as uuidV4 } from 'uuid'
import jwt from 'jsonwebtoken'
import UserService from '../service/users-service.js'
import checkToken from '../helpers/checkToken.js'
import checkPermission, { permissionIndex } from '../helpers/checkPermission.js'
import { IUser } from '../types/user-type.js'
import { userSchema } from '../model/userSchema.js'

const router = Router()
const userService = new UserService('./users.json')

router.get(
  '/me',
  // @ts-ignore
  checkToken,
  checkPermission([
    permissionIndex.admin,
    permissionIndex.director,
    permissionIndex.manager,
    permissionIndex.user
  ]),
  (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const user: IUser = req.user

      res.status(200).json(user)
    } catch (error) {
      res.status(500).json({ error: 'Serverda xatolik!' })
    }
  }
)

router.get(
  '/users',
  // @ts-ignore
  checkToken,
  checkPermission([permissionIndex.admin, permissionIndex.director]),
  (req: Request, res: Response) => {
    try {
      const users = userService.getUsers()
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ error: 'Serverda xatolik!' })
    }
  }
)

router.get(
  '/user/:username',
  // @ts-ignore
  checkToken,
  checkPermission([permissionIndex.admin, permissionIndex.director]),
  (req: Request, res: Response) => {
    try {
      const username = req.params.username
      const user = userService.getUserByUsername(username)
      if (!user) {
        return res.status(403).json({ error: 'Foydalanuvchi topilmadi' })
      }
      res.status(200).json(user)
    } catch (error) {
      res.status(500).json({ error: 'Serverda xatolik!' })
    }
  }
)

router.post(
  '/user',
  // @ts-ignore
  checkToken,
  checkPermission([permissionIndex.admin, permissionIndex.director]),
  (req: Request, res: Response) => {
    try {
      const newUser: IUser = req.body
      const result = userSchema.safeParse(newUser)
      if (!result.success)
        return res.status(400).json({ errors: result.error.errors })

      const user = userService.getUserByUsername(newUser.username)
      if (user) {
        return res.status(403).json({ error: 'username ishlatilgan!' })
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
      const token = jwt.sign(preparedUser, process.env.JWT_SECRET_KEY || '', {
        expiresIn: '1h'
      })
      return res.status(201).json({ token })
    } catch (error) {
      res.status(500).json({ error: 'Failed to add user' })
    }
  }
)

router.patch(
  '/user/:username',
  // @ts-ignore
  checkToken,
  checkPermission([permissionIndex.admin, permissionIndex.director]),
  (req: Request, res: Response) => {
    try {
      const username = req.params.username
      const updatedUser = req.body

      const result = userSchema.safeParse(updatedUser)
      if (!result.success) {
        return res.status(403).json({ errors: result.error.errors })
      }

      const user = userService.updateUser(username, updatedUser)
      if (!user) {
        return res.status(403).json({ error: 'Foydalanuvchi topilmadi' })
      }
      res.status(200).json(user)
    } catch (error) {
      res.status(500).json({ error: 'Serverda xatolik!' })
    }
  }
)

router.delete(
  '/user/:username',
  // @ts-ignore
  checkToken,
  checkPermission([permissionIndex.admin, permissionIndex.director]),
  (req: Request, res: Response) => {
    try {
      const username = req.params.username
      const deleted = userService.deleteUser(username)
      if (!deleted) {
        return res.status(403).json({ error: 'Foydalanuvchi topilmadi' })
      }
      res.status(200).json({message: 'User Deleted Successfully!'})
    } catch (error) {
      res.status(500).json({ error: 'Serverda xatolik!' })
    }
  }
)

export default router