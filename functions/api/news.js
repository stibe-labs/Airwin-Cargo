import { authenticateRequest, jsonResponse, errorResponse } from '../utils/crypto.js';

// ====================================================================
// NEWS & UPDATES (INSIGHTS) API
// ====================================================================

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// GET: Fetch Articles (Public: Published Only; Admin: All with filters)
export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const user = await authenticateRequest(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const slug = url.searchParams.get('slug');

    // Single article lookup
    if (id || slug) {
      let article;
      if (id) {
        article = await env.DB.prepare('SELECT * FROM news_articles WHERE id = ?').bind(parseInt(id)).first();
      } else {
        article = await env.DB.prepare('SELECT * FROM news_articles WHERE slug = ?').bind(slug).first();
      }

      if (!article) return errorResponse('Article not found', 404);
      return jsonResponse({ success: true, article });
    }

    // Article list
    const search = (url.searchParams.get('q') || '').trim();
    const category = (url.searchParams.get('category') || '').trim();
    const status = (url.searchParams.get('status') || '').trim();
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM news_articles WHERE 1=1';
    const params = [];

    // Public users only see PUBLISHED articles
    if (!user) {
      query += " AND status = 'PUBLISHED'";
    } else if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND LOWER(category) = ?';
      params.push(category.toLowerCase());
    }

    if (search) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(category) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results: articles } = await env.DB.prepare(query).bind(...params).all();

    // Total count
    let countQuery = 'SELECT COUNT(*) as total FROM news_articles WHERE 1=1';
    const countParams = [];
    if (!user) {
      countQuery += " AND status = 'PUBLISHED'";
    } else if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (category) {
      countQuery += ' AND LOWER(category) = ?';
      countParams.push(category.toLowerCase());
    }
    if (search) {
      countQuery += ' AND (LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(category) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      countParams.push(s, s, s);
    }

    const countRes = await env.DB.prepare(countQuery).bind(...countParams).first();

    return jsonResponse({
      success: true,
      articles: articles || [],
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

// POST: Create News Article (Admin Only)
export async function onRequestPost({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const title = (body.title || '').trim();
    let slug = (body.slug || '').trim();
    const category = (body.category || 'Logistics Management').trim();
    const read_time = (body.read_time || '4 min read').trim();
    const image_url = (body.image_url || '/images/news/news_1.jpg').trim();
    const summary = (body.summary || '').trim();
    const content = (body.content || '').trim();
    const author = (body.author || 'Airwin Editorial').trim();
    const status = (body.status || 'PUBLISHED').toUpperCase();
    let publish_date = (body.publish_date || '').trim();

    if (!title) return errorResponse('Article title is required', 400);
    if (!summary) return errorResponse('Article summary/excerpt is required', 400);

    if (!slug) {
      slug = slugify(title);
    }

    // Ensure unique slug
    const existing = await env.DB.prepare('SELECT id FROM news_articles WHERE slug = ?').bind(slug).first();
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    if (!publish_date) {
      const d = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      publish_date = `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    }

    const res = await env.DB.prepare(`
      INSERT INTO news_articles (
        title, slug, category, read_time, image_url,
        summary, content, author, status, publish_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title, slug, category, read_time, image_url,
      summary, content, author, status, publish_date
    ).run();

    return jsonResponse({
      success: true,
      message: 'Article published successfully',
      id: res.meta.last_row_id,
      slug
    }, 201);
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// PUT: Update News Article (Admin Only)
export async function onRequestPut({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const id = parseInt(body.id);

    if (!id) return errorResponse('Article ID is required', 400);

    const title = (body.title || '').trim();
    const category = (body.category || 'Logistics Management').trim();
    const read_time = (body.read_time || '4 min read').trim();
    const image_url = (body.image_url || '').trim();
    const summary = (body.summary || '').trim();
    const content = (body.content || '').trim();
    const author = (body.author || 'Airwin Editorial').trim();
    const status = (body.status || 'PUBLISHED').toUpperCase();
    const publish_date = (body.publish_date || '').trim();

    if (!title) return errorResponse('Article title is required', 400);

    await env.DB.prepare(`
      UPDATE news_articles
      SET title = ?, category = ?, read_time = ?, image_url = ?,
          summary = ?, content = ?, author = ?, status = ?,
          publish_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title, category, read_time, image_url,
      summary, content, author, status,
      publish_date, id
    ).run();

    return jsonResponse({
      success: true,
      message: 'Article updated successfully'
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// DELETE: Remove News Article (Admin Only)
export async function onRequestDelete({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id'));

    if (!id) return errorResponse('Article ID is required', 400);

    await env.DB.prepare('DELETE FROM news_articles WHERE id = ?').bind(id).run();

    return jsonResponse({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 204);
}
