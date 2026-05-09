import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";


const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: "Invalid resource id",
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }

  const statusCode = err.statusCode || 500;
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(` [ERROR] ${err.message}`);
  } else if (statusCode === 500) {
    // In production, maybe only log critical 500 errors
    console.error(err.stack); 
  }

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;

// const errorHandler = (err:any, req:Request, res:Response, next:NextFunction) => {
//   const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

//   res.status(statusCode).json({
//     message: err.message,
//     stack: process.env.NODE_ENV === 'production' ? null : err.stack
//   });
// };

// export default errorHandler;

