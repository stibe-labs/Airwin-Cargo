import { authenticateRequest, jsonResponse, errorResponse } from '../utils/crypto.js';

// POST /api/inquiries (Public Contact Form Submission)
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const subject = (body.subject || '').trim();
    const service = (body.service || body.service_of_interest || 'General Freight').trim();
    const message = (body.message || body.comment || '').trim();

    if (!name) return errorResponse('Please enter your name', 400);
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return errorResponse('Please enter a valid email address', 400);
    if (!phone) return errorResponse('Please enter your phone number', 400);
    if (!message) return errorResponse('Please enter your message', 400);

    const res = await env.DB.prepare(`
      INSERT INTO contact_inquiries (name, email, phone, subject, service_of_interest, message, status)
      VALUES (?, ?, ?, ?, ?, ?, 'NEW')
    `).bind(name, email, phone, subject || 'General Inquiry', service, message).run();

    return jsonResponse({
      success: true,
      message: 'Thank you! Your message has been received by Airwin Central Operations. Our team will get in touch promptly.',
      id: res.meta.last_row_id
    }, 201);
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// GET /api/inquiries (Protected Admin Inbox)
export async function onRequestGet({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const url = new URL(request.url);
    const search = (url.searchParams.get('q') || '').trim();
    const status = (url.searchParams.get('status') || '').trim();
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM contact_inquiries WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(subject) LIKE ? OR LOWER(message) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s, s, s);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results: inquiries } = await env.DB.prepare(query).bind(...params).all();

    // Total count
    let countQuery = 'SELECT COUNT(*) as total FROM contact_inquiries WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(subject) LIKE ? OR LOWER(message) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      countParams.push(s, s, s, s, s);
    }
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const countRes = await env.DB.prepare(countQuery).bind(...countParams).first();

    return jsonResponse({
      success: true,
      inquiries: inquiries || [],
      pagination: {
        page,
        limit,
        total: countRes?.total || 0,
        pages: Math.ceil((countRes?.total || 0) / limit)
      }
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// PATCH /api/inquiries (Update status or notes)
export async function onRequestPatch({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const id = parseInt(body.id);
    if (!id) return errorResponse('Inquiry ID is required', 400);

    const current = await env.DB.prepare('SELECT * FROM contact_inquiries WHERE id = ?').bind(id).first();
    if (!current) return errorResponse('Inquiry not found', 404);

    const status = body.status !== undefined ? body.status : current.status;
    const admin_notes = body.admin_notes !== undefined ? body.admin_notes : current.admin_notes;

    await env.DB.prepare(`
      UPDATE contact_inquiries SET status = ?, admin_notes = ?, updated_at = datetime('now') WHERE id = ?
    `).bind(status, admin_notes, id).run();

    return jsonResponse({
      success: true,
      message: 'Inquiry updated successfully'
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// DELETE /api/inquiries
export async function onRequestDelete({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const id = parseInt(body.id);
    if (!id) return errorResponse('Inquiry ID is required', 400);

    await env.DB.prepare('DELETE FROM contact_inquiries WHERE id = ?').bind(id).run();

    return jsonResponse({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 204);
}
