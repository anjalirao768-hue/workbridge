import { cookies } from 'next/headers'
import { verifyJwt, JwtPayload } from './jwt'

export function getCurrentUser(): JwtPayload | null {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) return null
    
    return verifyJwt(token)
  } catch {
    return null
  }
}

export function requireAuth(): JwtPayload {
  const user = getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export function requireRole(allowedRoles: string | string[]): JwtPayload {
  const user = requireAuth()
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required role(s): ${roles.join(', ')}`)
  }
  
  return user
}