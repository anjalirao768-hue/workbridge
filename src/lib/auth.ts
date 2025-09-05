import { verifyJwt } from './jwt';

export async function verifyToken(token: string) {
  return await verifyJwt(token);
}