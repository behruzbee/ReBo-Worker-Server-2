import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import UserService from '../service/users-service.js';

const userService = new UserService('./users.json')

function checkToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен!' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || '');
    // @ts-ignore
    req.user = decoded;
    // @ts-ignore
    const user = userService.getUserByUsername(decoded.username)
    if(!user) {
      throw {name: 'TokenExpiredError'}
    }

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истёк!' });
    } else {
      return res.status(401).json({ error: 'Невалидный токен!' });
    }
  }
}

export default checkToken;