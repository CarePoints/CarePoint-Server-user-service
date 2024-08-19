// types/express.d.ts

import { UserPayload } from '../utils/authMiddleware'; 

declare global {
  namespace Express {
    interface Request {
      usersData?: UserPayload; 
    }
  }
}