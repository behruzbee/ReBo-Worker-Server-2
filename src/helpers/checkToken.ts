import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

function checkToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен!' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || '');
    // @ts-ignore
    req.user = decoded;

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