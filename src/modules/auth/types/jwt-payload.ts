import { UserRole } from '@/modules/user/schema/user.schema';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type JwtPayloadUser = {
  id: string;
  email: string;
  role: UserRole;
};
