// src/lib/auth.js — JWT helper (sign, verify, extract, authenticate)
// npm install jose

import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ganti-dengan-secret-yang-kuat-minimal-32-karakter"
);

const ALGORITHM = "HS256";
const EXPIRES_IN = "8h";

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}

export function extractToken(request) {
  // 1. Coba dari Authorization: Bearer <token>
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // 2. Coba dari cookie 'token'
  const cookie = request.cookies?.get?.("token");
  if (cookie?.value) return cookie.value;

  return null;
}

export async function authenticate(request) {
  const token = extractToken(request);
  if (!token) throw new Error("Token tidak ditemukan.");
  return verifyToken(token);
}
