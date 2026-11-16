import { verifyPassword, hashPassword, createJWT, authenticateRequest, jsonResponse, errorResponse } from '../utils/crypto.js';

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

export async function onRequestPut({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const { name, current_password, new_password } = body;

    const dbUser = await env.DB.prepare('SELECT * FROM admin_users WHERE id = ?').bind(user.sub).first();
    if (!dbUser) return errorResponse('User not found', 404);

    let updatedName = dbUser.name;
    if (name && name.trim()) {
      updatedName = name.trim();
    }

    if (new_password) {
      if (!current_password) {
        return errorResponse('Current password is required to set a new password', 400);
      }
      const isCurrentValid = await verifyPassword(current_password, dbUser.salt, dbUser.password_hash);
      if (!isCurrentValid) {
        return errorResponse('Current password is incorrect', 400);
      }
      if (new_password.length < 8) {
        return errorResponse('New password must be at least 8 characters long', 400);
      }

      const { salt, hash } = await hashPassword(new_password);
      await env.DB.prepare(`
        UPDATE admin_users SET name = ?, password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = ?
      `).bind(updatedName, hash, salt, user.sub).run();

      return jsonResponse({
        success: true,
        message: 'Password and profile updated successfully'
      });
    }

    await env.DB.prepare(`
      UPDATE admin_users SET name = ?, updated_at = datetime('now') WHERE id = ?
    `).bind(updatedName, user.sub).run();

    return jsonResponse({
      success: true,
      message: 'Profile updated successfully',
      name: updatedName
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 204);
}
