import {Request, Response, NextFunction} from 'express';


class AppError extends Error{
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}


const errorMiddleware = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) =>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status,

       res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
}

export { AppError, errorMiddleware };
