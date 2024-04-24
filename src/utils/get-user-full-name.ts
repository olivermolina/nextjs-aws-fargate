import { User } from '../types/user';
import { AuthUser } from '../contexts/auth/jwt/auth-context';

export const getUserFullName = (
  user?: Pick<User | AuthUser, 'first_name' | 'last_name' | 'email'> | null
) => {
  if (!user) return '';

  if(!user.first_name && !user.last_name) return user.email;

  return `${user.first_name || ''} ${user.last_name || ''}`;
};
