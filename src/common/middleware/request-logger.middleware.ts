import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
}
