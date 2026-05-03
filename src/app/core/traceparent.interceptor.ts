import { HttpInterceptorFn } from '@angular/common/http';

function generateTraceparent(): string {
  const traceId = crypto.randomUUID().replace(/-/g, '');
  const spanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  return `00-${traceId}-${spanId}-01`;
}

export const traceparentInterceptor: HttpInterceptorFn = (req, next) => {
  const traceparent = generateTraceparent();
  return next(req.clone({ setHeaders: { traceparent } }));
};
