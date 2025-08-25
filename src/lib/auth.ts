import { cookies } from 'next/headers'
import { verifyJwt, JwtPayload } from './jwt'

export async function getCurrentUser(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) return null
    
    return verifyJwt(token)
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<JwtPayload> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(allowedRoles: string | string[]): Promise<JwtPayload> {
  const user = await requireAuth()
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required role(s): ${roles.join(', ')}`)
  }
  
  return user
}