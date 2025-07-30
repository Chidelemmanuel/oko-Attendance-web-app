import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { jwtVerify } from 'jose';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function verifyJwt(token: string) {
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
        return payload;
    } catch(error) {
        return null;
    }
}
