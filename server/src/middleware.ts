import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload, UserRole } from '../../types.js';
import { ROLE_LABELS_HE } from '../../types.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'drivewise-dev-secret-change-in-production';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'נדרש אסימון גישה', code: 401 });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'אסימון לא תקין או שפג תוקפו', code: 403 });
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'נדרשת הזדהות', code: 401 });
      return;
    }

    if (!roles.includes(req.user.role)) {
      const requiredLabels = roles.map((r) => ROLE_LABELS_HE[r]).join(' | ');
      res.status(403).json({
        error: `הרשאות לא מספיקות. נדרש: ${requiredLabels}`,
        code: 403,
      });
      return;
    }

    next();
  };
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      req.user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      // מסלול ציבורי — אסימון לא תקין מתעלם
    }
  }

  next();
}

export { JWT_SECRET };
