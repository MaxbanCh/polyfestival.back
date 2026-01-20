import 'dotenv/config';

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m';
export const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION || '7d';
export const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true'
export const COOKIE_SAMESITE =
    (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none' | undefined) || 'lax'


if (!JWT_SECRET) {
  throw new Error('JWT_SECRET manquant dans .env');
}
