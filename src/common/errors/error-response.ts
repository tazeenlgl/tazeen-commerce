import { Request, Response } from 'express';

/** Single source of the JSON error shape, used by the exception filter and by middleware. */
export function sendError(
  req: Request,
  res: Response,
  statusCode: number,
  error: string,
  message: string | string[],
  headers: Record<string, string | number> = {},
): void {
  if (res.headersSent) return;
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, String(v));
  res.status(statusCode).json({
    statusCode,
    error,
    message,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
}
