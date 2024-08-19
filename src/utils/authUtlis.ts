import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import secretKey from '../config/Jwt/jwtConfig';

interface User {
    _id: any;
    email: string;
}

function generateToken(user: User): string {
    const payload = {
        id: user._id,
        email: user.email,
      
    };

    const options: SignOptions = { expiresIn: '1h' };

    return jwt.sign(payload, secretKey, options);
}

function generateRefreshToken(user: User): string {
    const payload = {
        id: user._id,
        email: user.email,
    };

    const options: SignOptions = { expiresIn: '24h' };

    return jwt.sign(payload, secretKey, options);
}

function verifyToken(token: string): string | JwtPayload {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        throw new Error('Invalid token');
    }
}

export { generateToken, generateRefreshToken, verifyToken };
