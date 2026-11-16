import { authenticateRequest, jsonResponse, errorResponse } from '../utils/crypto.js';

// ====================================================================
// CAREERS API (JOBS & CANDIDATE APPLICATIONS / PARTICIPANTS)
// ====================================================================

// GET: Fetch Jobs or Applications
export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const url = new URL(request.url);
    const type = (url.searchParams.get('type') || 'jobs').toLowerCase();

    // -------------------------------------------------------------
    // 1. Fetch Job Postings
    // -------------------------------------------------------------
    if (type === 'jobs') {
      const user = await authenticateRequest(request);
      const all = url.searchParams.get('all') === 'true' || !!user;

      let query = 'SELECT * FROM job_postings';
      if (!all) {
        query += ' WHERE is_active = 1';
      }
      query += ' ORDER BY created_at DESC';

      const { results: jobs } = await env.DB.prepare(query).all();
      return jsonResponse({
        success: true,
        jobs: jobs || []
      });
    }

    // -------------------------------------------------------------
    // 2. Fetch Job Applications (Participants / Requests - Admin Only)
    // -------------------------------------------------------------
    if (type === 'applications') {
      const user = await authenticateRequest(request);
      if (!user) return errorResponse('Unauthorized: Admin access required', 401);

      const search = (url.searchParams.get('q') || '').trim();
      const status = (url.searchParams.get('status') || '').trim();
      const role = (url.searchParams.get('role') || '').trim();
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM job_applications WHERE 1=1';
      const params = [];

      if (search) {
        query += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(place) LIKE ? OR LOWER(role) LIKE ?)';
        const s = `%${search.toLowerCase()}%`;
        params.push(s, s, s, s, s);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const { results: applications } = await env.DB.prepare(query).bind(...params).all();

      // Total count
      let countQuery = 'SELECT COUNT(*) as total FROM job_applications WHERE 1=1';
      const countParams = [];
      if (search) {
        countQuery += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(place) LIKE ? OR LOWER(role) LIKE ?)';
        const s = `%${search.toLowerCase()}%`;
        countParams.push(s, s, s, s, s);
      }
      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      if (role) {
        countQuery += ' AND role = ?';
        countParams.push(role);
      }

      const countRes = await env.DB.prepare(countQuery).bind(...countParams).first();

      return jsonResponse({
        success: true,
        applications: applications || [],
        pagination: {
          page,
          limit,
          total: countRes?.total || 0,
          pages: Math.ceil((countRes?.total || 0) / limit)
        }
      });
    }

    return errorResponse("Invalid type parameter: specify 'jobs' or 'applications'", 400);
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// POST: Create Job Posting (Admin) OR Submit Candidate Application (Public)
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const url = new URL(request.url);
    const type = (url.searchParams.get('type') || '').toLowerCase();
    const body = await request.json().catch(() => ({}));

    // -------------------------------------------------------------
    // Candidate Job Application Submission (Public or from careers.html)
    // -------------------------------------------------------------
    if (type === 'applications' || (!type && body.role && body.name)) {
      const name = (body.name || '').trim();
      const email = (body.email || '').trim();
      const phone = (body.phone || body.mobile || '').trim();
      const role = (body.role || body.position || 'General Application').trim();
      const place = (body.place || body.city || '').trim();
      const resume_filename = (body.resume_filename || body.cv_name || '').trim();
      const resume_url = (body.resume_url || body.cv_data || '').trim();
      const cover_notes = (body.cover_notes || body.notes || body.message || '').trim();
      const job_id = body.job_id ? parseInt(body.job_id) : null;

      if (!name) return errorResponse('Please enter your full name', 400);
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) return errorResponse('Please enter a valid email address', 400);
      if (!phone) return errorResponse('Please enter your contact phone number', 400);
      if (!role) return errorResponse('Please select the position you are applying for', 400);

      const res = await env.DB.prepare(`
        INSERT INTO job_applications (
          job_id, role, name, email, phone, place,
          resume_filename, resume_url, cover_notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW')
      `).bind(
        job_id, role, name, email, phone, place,
        resume_filename, resume_url, cover_notes
      ).run();

      return jsonResponse({
        success: true,
        message: 'Your application has been successfully submitted! Our talent acquisition team will review your profile promptly.',
        id: res.meta.last_row_id
      }, 201);
    }

    // -------------------------------------------------------------
    // Create Job Posting (Admin Only)
    // -------------------------------------------------------------
    if (type === 'jobs') {
      const user = await authenticateRequest(request);
      if (!user) return errorResponse('Unauthorized: Admin access required', 401);

      const title = (body.title || '').trim();
      const department = (body.department || 'Operations & Logistics').trim();
      const location = (body.location || 'Calicut Airport Jn.').trim();
      const job_type = (body.job_type || 'Full-Time').trim();
      const salary = (body.salary || 'Negotiable').trim();
      const experience = (body.experience || 'Freshers or Experienced welcome').trim();
      const requirements = (body.requirements || '').trim();
      const responsibilities = (body.responsibilities || '').trim();
      const is_active = body.is_active === 0 || body.is_active === false ? 0 : 1;

      if (!title) return errorResponse('Job title is required', 400);

      const res = await env.DB.prepare(`
        INSERT INTO job_postings (
          title, department, location, job_type, salary,
          experience, requirements, responsibilities, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        title, department, location, job_type, salary,
        experience, requirements, responsibilities, is_active
      ).run();

      return jsonResponse({
        success: true,
        message: 'Job posting created successfully',
        id: res.meta.last_row_id
      }, 201);
    }

    return errorResponse("Invalid request: specify type='jobs' or type='applications'", 400);
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// PUT / PATCH: Update Job Posting or Candidate Application (Admin Only)
export async function onRequestPut({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const url = new URL(request.url);
    const type = (url.searchParams.get('type') || '').toLowerCase();
    const body = await request.json().catch(() => ({}));
    const id = parseInt(body.id || url.searchParams.get('id'));

    if (!id) return errorResponse('Record ID is required', 400);

    // -------------------------------------------------------------
    // Update Candidate Application Status / HR Notes
    // -------------------------------------------------------------
    if (type === 'applications') {
      const status = (body.status || '').trim();
      const hr_notes = body.hr_notes !== undefined ? body.hr_notes : null;

      const updates = [];
      const params = [];

      if (status) {
        updates.push('status = ?');
        params.push(status);
      }
      if (hr_notes !== null) {
        updates.push('hr_notes = ?');
        params.push(hr_notes);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      await env.DB.prepare(`
        UPDATE job_applications
        SET ${updates.join(', ')}
        WHERE id = ?
      `).bind(...params).run();

      return jsonResponse({
        success: true,
        message: 'Applicant status updated successfully'
      });
    }

    // -------------------------------------------------------------
    // Update Job Posting Details
    // -------------------------------------------------------------
    if (type === 'jobs') {
      const title = (body.title || '').trim();
      const department = (body.department || '').trim();
      const location = (body.location || '').trim();
      const job_type = (body.job_type || 'Full-Time').trim();
      const salary = (body.salary || 'Negotiable').trim();
      const experience = (body.experience || '').trim();
      const requirements = (body.requirements || '').trim();
      const responsibilities = (body.responsibilities || '').trim();
      const is_active = body.is_active === 0 || body.is_active === false ? 0 : 1;

      if (!title) return errorResponse('Job title is required', 400);

      await env.DB.prepare(`
        UPDATE job_postings
        SET title = ?, department = ?, location = ?, job_type = ?,
            salary = ?, experience = ?, requirements = ?, responsibilities = ?,
            is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        title, department, location, job_type,
        salary, experience, requirements, responsibilities,
        is_active, id
      ).run();

      return jsonResponse({
        success: true,
        message: 'Job posting updated successfully'
      });
    }

    return errorResponse("Invalid type parameter: specify 'jobs' or 'applications'", 400);
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// DELETE: Remove Job Posting or Application (Admin Only)
export async function onRequestDelete({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const url = new URL(request.url);
    const type = (url.searchParams.get('type') || '').toLowerCase();
    const id = parseInt(url.searchParams.get('id'));

    if (!id) return errorResponse('Record ID is required', 400);

    if (type === 'jobs') {
      await env.DB.prepare('DELETE FROM job_postings WHERE id = ?').bind(id).run();
      return jsonResponse({ success: true, message: 'Job posting deleted successfully' });
    }

    if (type === 'applications') {
      await env.DB.prepare('DELETE FROM job_applications WHERE id = ?').bind(id).run();
      return jsonResponse({ success: true, message: 'Application deleted successfully' });
    }

    return errorResponse("Invalid type parameter: specify 'jobs' or 'applications'", 400);
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 204);
}
