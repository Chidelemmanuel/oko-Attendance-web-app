import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { jwtVerify, SignJWT } from 'jose';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function signJwt(payload: { [key: string]: any }, expiresIn: string = '1d') {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(getJwtSecretKey());
}


export async function verifyJwt(token: string) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecretKey());
        return payload;
    } catch(error) {
        return null;
    }
}
