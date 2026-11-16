// ====================================================================
// AIRWIN CARGO - NATIVE WEB CRYPTO UTILITIES (ZERO DEPENDENCIES)
// ====================================================================

const JWT_SECRET = 'airwin-cargo-production-jwt-secret-key-2026-secure-auth';

// Helper: Convert ArrayBuffer to Hex string
export function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert Hex string to Uint8Array
export function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Hash password with PBKDF2
export async function hashPassword(password, saltHex = null) {
  if (!saltHex) {
    const saltBytes = new Uint8Array(16);
    crypto.getRandomValues(saltBytes);
    saltHex = bufferToHex(saltBytes);
  }

  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBuffer(saltHex),
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  return {
    salt: saltHex,
    hash: bufferToHex(derivedBits)
  };
}

// PBKDF2 Password Verification
export async function verifyPassword(password, saltHex, expectedHashHex) {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBuffer(saltHex),
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  const derivedHex = bufferToHex(derivedBits);
  return derivedHex.toLowerCase() === expectedHashHex.toLowerCase();
}

// Base64URL encoding/decoding for JWT
function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  return atob(b64);
}

// Create signed JWT token
export async function createJWT(payload, expiresInSeconds = 86400 * 7) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(unsignedToken));
  const sigB64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return `${unsignedToken}.${sigB64}`;
}

// Verify JWT token
export async function verifyJWT(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  try {
    const rawSig = Uint8Array.from(base64UrlDecode(sigB64), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify('HMAC', key, rawSig, enc.encode(unsignedToken));
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// Extract Bearer token from request headers or cookies
export async function authenticateRequest(request) {
  const authHeader = request.headers.get('Authorization') || '';
  let token = null;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    // Check cookie
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/airwin_admin_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;
  return await verifyJWT(token);
}

// Standard JSON API Response helpers
export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    }
  });
}

export function errorResponse(message, status = 400, details = null) {
  return jsonResponse({ success: false, error: message, details }, status);
}
