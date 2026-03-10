import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (process.env.NODE_ENV === 'production' && (!secret || !refreshSecret)) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production');
  }

  return {
    secret: secret || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: refreshSecret || 'default-refresh-secret-change-me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
});
