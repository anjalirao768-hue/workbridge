export {};

import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

// Convert string secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
    [key: string]: string | number | undefined; // More specific index signature
}  

export async function signJwt(payload: JwtPayload, expiresIn: string = "7d"): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

// Synchronous version for middleware (fallback to jsonwebtoken)
import jwt from "jsonwebtoken";

export function verifyJwtSync(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
