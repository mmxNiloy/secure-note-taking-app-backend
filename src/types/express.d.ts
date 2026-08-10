import { JwtPayloadUser } from '@/modules/auth/types/jwt-payload';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends JwtPayloadUser {}
  }
}

export {};
