import { Request, Response, NextFunction } from 'express'

export const permissionIndex = {
    admin: 0,
    director: 1,
    manager: 2,
    user: 3
}

function checkPermission(allowedStatusIndexes: number[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const user = req.user

      if (!user) {
        return res.status(401).json({ error: 'Пользователь не авторизован!' })
      }

      if (!allowedStatusIndexes.includes(user.status_index)) {
        return res
          .status(403)
          .json({ error: 'Доступ запрещен! Недостаточно прав.' })
      }

      next() 
    } catch (error) {
      return res.status(500).json({ error: 'Ошибка проверки прав доступа' })
    }
  }
}

export default checkPermission
