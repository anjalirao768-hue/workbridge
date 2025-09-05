import { verifyJwt } from './jwt';
import { cookies } from 'next/headers';

export async function verifyToken(token: string) {
  return await verifyJwt(token);
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) return null;
    
    return await verifyJwt(token);
  } catch {
    return null;
  }
}

export async function getCurrentUserWithFreshData() {
  // For now, return the same as getCurrentUser
  // This can be extended later to fetch fresh data from database
  return await getCurrentUser();
}