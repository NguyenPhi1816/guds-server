import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/constants/enum';

export const ROLES_KEY = 'role';
export const Roles = (role: UserRoles) => SetMetadata(ROLES_KEY, role);
