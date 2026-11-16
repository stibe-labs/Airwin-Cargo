import { authenticateRequest, jsonResponse, errorResponse } from '../utils/crypto.js';

// POST /api/quotes (Public Quote Request Submission)
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const name = (body.name || '').trim();
    const mobile = (body.mobile || body.phone || '').trim();
    const email = (body.email || '').trim();
    const company = (body.company || '').trim();
    const service_type = (body.service_type || body.service || 'Air Freight').trim();
    const origin = (body.origin || '').trim();
    const destination = (body.destination || '').trim();
    const cargo_weight = (body.cargo_weight || body.weight || '').trim();
    const cargo_dimensions = (body.cargo_dimensions || body.dimensions || '').trim();
    const comments = (body.comments || body.message || '').trim();

    if (!name) return errorResponse('Please enter your name', 400);
    if (!mobile) return errorResponse('Please enter your mobile/phone number', 400);
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return errorResponse('Please enter a valid email address', 400);

    const res = await env.DB.prepare(`
      INSERT INTO quote_requests (
        name, mobile, email, company, service_type,
        origin, destination, cargo_weight, cargo_dimensions, comments, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `).bind(
      name, mobile, email, company, service_type,
      origin, destination, cargo_weight, cargo_dimensions, comments
    ).run();

    return jsonResponse({
      success: true,
      message: 'Thank you! Your quote request has been received. Our freight specialists will prepare a competitive proposal shortly.',
      id: res.meta.last_row_id
    }, 201);
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// GET /api/quotes (Protected Admin Quote Manager)
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

    let query = 'SELECT * FROM quote_requests WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(mobile) LIKE ? OR LOWER(origin) LIKE ? OR LOWER(destination) LIKE ? OR LOWER(company) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s, s, s, s);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results: quotes } = await env.DB.prepare(query).bind(...params).all();

    // Total count
    let countQuery = 'SELECT COUNT(*) as total FROM quote_requests WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(mobile) LIKE ? OR LOWER(origin) LIKE ? OR LOWER(destination) LIKE ? OR LOWER(company) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      countParams.push(s, s, s, s, s, s);
    }
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const countRes = await env.DB.prepare(countQuery).bind(...countParams).first();

    return jsonResponse({
      success: true,
      quotes: quotes || [],
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

// PATCH /api/quotes (Update quote status, rate/amount, notes)
export async function onRequestPatch({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const id = parseInt(body.id);
    if (!id) return errorResponse('Quote ID is required', 400);

    const current = await env.DB.prepare('SELECT * FROM quote_requests WHERE id = ?').bind(id).first();
    if (!current) return errorResponse('Quote request not found', 404);

    const status = body.status !== undefined ? body.status : current.status;
    const quoted_amount = body.quoted_amount !== undefined ? (body.quoted_amount ? parseFloat(body.quoted_amount) : null) : current.quoted_amount;
    const currency = body.currency !== undefined ? body.currency : current.currency;
    const admin_notes = body.admin_notes !== undefined ? body.admin_notes : current.admin_notes;

    await env.DB.prepare(`
      UPDATE quote_requests SET
        status = ?, quoted_amount = ?, currency = ?, admin_notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, quoted_amount, currency, admin_notes, id).run();

    return jsonResponse({
      success: true,
      message: 'Quote updated successfully'
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// DELETE /api/quotes
export async function onRequestDelete({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const id = parseInt(body.id);
    if (!id) return errorResponse('Quote ID is required', 400);

    await env.DB.prepare('DELETE FROM quote_requests WHERE id = ?').bind(id).run();

    return jsonResponse({
      success: true,
      message: 'Quote request deleted successfully'
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 204);
}
