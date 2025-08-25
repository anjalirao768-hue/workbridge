import { cookies } from 'next/headers'
import { verifyJwt, JwtPayload } from './jwt'
import { supabase } from '@/app/lib/supabase'

interface UserData {
  userId: string;
  email: string;
  role: string;
  skills?: string[];
  cover_letter?: string;
  experiences?: string;
  age?: number;
}

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

export async function getCurrentUserWithFreshData(): Promise<UserData | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    // Fetch fresh data from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, role, skills, cover_letter, experiences, age')
      .eq('id', user.userId)
      .single()

    if (error || !userData) {
      console.error('Failed to fetch fresh user data:', error)
      return null
    }

    return {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      skills: userData.skills || [],
      cover_letter: userData.cover_letter,
      experiences: userData.experiences,
      age: userData.age
    }
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