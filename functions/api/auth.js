import { verifyPassword, createJWT, authenticateRequest, jsonResponse, errorResponse } from '../utils/crypto.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = (body.username || body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!username || !password) {
      return errorResponse('Username/Email and password are required', 400);
    }

    if (!env.DB) {
      return errorResponse('Database binding not configured', 500);
    }

    // Lookup user by username or email
    const user = await env.DB.prepare(
      'SELECT id, username, email, password_hash, salt, role, name FROM admin_users WHERE LOWER(username) = ? OR LOWER(email) = ?'
    ).bind(username, username).first();

    if (!user) {
      return errorResponse('Invalid username or password', 401);
    }

    // Verify PBKDF2 hash
    const isValid = await verifyPassword(password, user.salt, user.password_hash);
    if (!isValid) {
      return errorResponse('Invalid username or password', 401);
    }

    // Update last_login
    await env.DB.prepare(
      'UPDATE admin_users SET last_login = datetime("now") WHERE id = ?'
    ).bind(user.id).run();

    // Generate JWT token (7-day validity)
    const tokenPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    };
    const token = await createJWT(tokenPayload, 86400 * 7);

    // Set secure HTTP-only cookie
    const cookieHeader = `airwin_admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${86400 * 7}`;

    return jsonResponse({
      success: true,
      message: 'Authentication successful',
      token,
      user: tokenPayload
    }, 200, { 'Set-Cookie': cookieHeader });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

export async function onRequestGet({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse('Unauthorized or session expired', 401);
    }

    return jsonResponse({
      success: true,
      authenticated: true,
      user
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 204);
}
