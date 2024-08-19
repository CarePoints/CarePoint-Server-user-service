
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import secretKey from '../config/Jwt/jwtConfig';


export interface UserPayload extends JwtPayload {
  id: string; 
  email: string;
}

function authenticationToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }


  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    req.usersData = decoded as UserPayload;
    
    next();
  });
}

export default authenticationToken;
