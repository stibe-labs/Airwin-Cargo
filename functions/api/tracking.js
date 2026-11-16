import { authenticateRequest, jsonResponse, errorResponse } from '../utils/crypto.js';

// GET /api/tracking
// 1. If ?awb=... provided: Public tracking search
// 2. If no ?awb: Protected Admin shipment list with search/filter
export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const url = new URL(request.url);
    const awb = (url.searchParams.get('awb') || '').trim();

    // 1. PUBLIC TRACKING BY AWB
    if (awb) {
      const shipment = await env.DB.prepare(
        'SELECT * FROM shipments WHERE LOWER(awb_number) = ? OR LOWER(reference_no) = ?'
      ).bind(awb.toLowerCase(), awb.toLowerCase()).first();

      if (!shipment) {
        return jsonResponse({
          success: true,
          found: false,
          query: awb,
          message: `No active shipment records found for "${awb}". Please verify your Air Waybill or Bill of Lading number.`
        });
      }

      // Fetch all checkpoint timeline events
      const { results: checkpoints } = await env.DB.prepare(
        'SELECT id, status, location, description, timestamp FROM shipment_checkpoints WHERE shipment_id = ? ORDER BY datetime(timestamp) ASC'
      ).bind(shipment.id).all();

      return jsonResponse({
        success: true,
        found: true,
        shipment: {
          id: shipment.id,
          awb_number: shipment.awb_number,
          reference_no: shipment.reference_no,
          cargo_type: shipment.cargo_type,
          service_level: shipment.service_level,
          origin_hub: shipment.origin_hub,
          origin_country: shipment.origin_country,
          destination_city: shipment.destination_city,
          destination_country: shipment.destination_country,
          sender_name: shipment.sender_name,
          sender_company: shipment.sender_company,
          receiver_name: shipment.receiver_name,
          receiver_company: shipment.receiver_company,
          pieces: shipment.pieces,
          weight_kg: shipment.weight_kg,
          dimensions: shipment.dimensions,
          current_status: shipment.current_status,
          estimated_delivery: shipment.estimated_delivery,
          delivered_at: shipment.delivered_at,
          created_at: shipment.created_at,
          updated_at: shipment.updated_at
        },
        checkpoints: checkpoints || []
      });
    }

    // 2. ADMIN LIST SHIPMENTS (Protected)
    const user = await authenticateRequest(request);
    if (!user) {
      return errorResponse('Authentication required to list all shipments', 401);
    }

    const search = (url.searchParams.get('q') || '').trim();
    const status = (url.searchParams.get('status') || '').trim();
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM shipments WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (LOWER(awb_number) LIKE ? OR LOWER(reference_no) LIKE ? OR LOWER(sender_name) LIKE ? OR LOWER(receiver_name) LIKE ? OR LOWER(destination_city) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s, s, s);
    }

    if (status) {
      query += ' AND current_status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results: shipments } = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM shipments WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ' AND (LOWER(awb_number) LIKE ? OR LOWER(reference_no) LIKE ? OR LOWER(sender_name) LIKE ? OR LOWER(receiver_name) LIKE ? OR LOWER(destination_city) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      countParams.push(s, s, s, s, s);
    }
    if (status) {
      countQuery += ' AND current_status = ?';
      countParams.push(status);
    }
    const countRes = await env.DB.prepare(countQuery).bind(...countParams).first();

    return jsonResponse({
      success: true,
      shipments: shipments || [],
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

// POST /api/tracking (Protected Admin Actions)
export async function onRequestPost({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const action = body.action || 'create_shipment';

    // ACTION A: CREATE NEW SHIPMENT
    if (action === 'create_shipment') {
      const awb = (body.awb_number || '').trim();
      const origin_hub = (body.origin_hub || '').trim();
      const destination_city = (body.destination_city || '').trim();

      if (!awb || !origin_hub || !destination_city) {
        return errorResponse('AWB number, Origin hub, and Destination city are required', 400);
      }

      // Check unique AWB
      const existing = await env.DB.prepare(
        'SELECT id FROM shipments WHERE LOWER(awb_number) = ?'
      ).bind(awb.toLowerCase()).first();

      if (existing) {
        return errorResponse(`A shipment with AWB "${awb}" already exists`, 409);
      }

      const status = body.current_status || 'BOOKED';

      const insertRes = await env.DB.prepare(`
        INSERT INTO shipments (
          awb_number, reference_no, cargo_type, service_level,
          origin_hub, origin_country, destination_city, destination_country,
          sender_name, sender_company, sender_phone,
          receiver_name, receiver_company, receiver_phone,
          pieces, weight_kg, dimensions, current_status, estimated_delivery, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        awb,
        body.reference_no || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        body.cargo_type || 'Air Freight',
        body.service_level || 'Standard',
        origin_hub,
        body.origin_country || 'UAE',
        destination_city,
        body.destination_country || 'India',
        body.sender_name || '',
        body.sender_company || '',
        body.sender_phone || '',
        body.receiver_name || '',
        body.receiver_company || '',
        body.receiver_phone || '',
        parseInt(body.pieces || 1),
        parseFloat(body.weight_kg || 0),
        body.dimensions || '',
        status,
        body.estimated_delivery || '',
        body.notes || ''
      ).run();

      const newId = insertRes.meta.last_row_id;

      // Add initial milestone checkpoint
      await env.DB.prepare(`
        INSERT INTO shipment_checkpoints (shipment_id, status, location, description, timestamp)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).bind(
        newId,
        status,
        origin_hub,
        body.initial_checkpoint_desc || 'Consignment booking registered in Airwin Central Freight System.'
      ).run();

      return jsonResponse({
        success: true,
        message: 'Shipment created successfully with initial checkpoint',
        id: newId,
        awb_number: awb
      }, 201);
    }

    // ACTION B: ADD CHECKPOINT TO SHIPMENT
    if (action === 'add_checkpoint') {
      const shipmentId = parseInt(body.shipment_id);
      const status = (body.status || '').trim();
      const location = (body.location || '').trim();
      const description = (body.description || '').trim();

      if (!shipmentId || !status || !location || !description) {
        return errorResponse('Shipment ID, status, location, and description are required', 400);
      }

      // Verify shipment exists
      const shipment = await env.DB.prepare('SELECT id FROM shipments WHERE id = ?').bind(shipmentId).first();
      if (!shipment) return errorResponse('Shipment not found', 404);

      const timestamp = body.timestamp ? body.timestamp : new Date().toISOString();

      await env.DB.prepare(`
        INSERT INTO shipment_checkpoints (shipment_id, status, location, description, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).bind(shipmentId, status, location, description, timestamp).run();

      // Update current status & timestamp on shipment
      let updateSql = 'UPDATE shipments SET current_status = ?, updated_at = datetime("now")';
      const updateParams = [status];
      if (status === 'DELIVERED') {
        updateSql += ', delivered_at = datetime("now")';
      }
      updateSql += ' WHERE id = ?';
      updateParams.push(shipmentId);

      await env.DB.prepare(updateSql).bind(...updateParams).run();

      return jsonResponse({
        success: true,
        message: `Checkpoint added & shipment status updated to ${status}`
      }, 201);
    }

    return errorResponse(`Unknown action: ${action}`, 400);
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// PUT /api/tracking (Update Shipment Details)
export async function onRequestPut({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const id = parseInt(body.id);
    if (!id) return errorResponse('Shipment ID is required', 400);

    const current = await env.DB.prepare('SELECT * FROM shipments WHERE id = ?').bind(id).first();
    if (!current) return errorResponse('Shipment not found', 404);

    const awb_number = body.awb_number !== undefined ? body.awb_number.trim() : current.awb_number;
    const cargo_type = body.cargo_type !== undefined ? body.cargo_type : current.cargo_type;
    const service_level = body.service_level !== undefined ? body.service_level : current.service_level;
    const origin_hub = body.origin_hub !== undefined ? body.origin_hub : current.origin_hub;
    const destination_city = body.destination_city !== undefined ? body.destination_city : current.destination_city;
    const sender_name = body.sender_name !== undefined ? body.sender_name : current.sender_name;
    const receiver_name = body.receiver_name !== undefined ? body.receiver_name : current.receiver_name;
    const pieces = body.pieces !== undefined ? parseInt(body.pieces) : current.pieces;
    const weight_kg = body.weight_kg !== undefined ? parseFloat(body.weight_kg) : current.weight_kg;
    const dimensions = body.dimensions !== undefined ? body.dimensions : current.dimensions;
    const current_status = body.current_status !== undefined ? body.current_status : current.current_status;
    const estimated_delivery = body.estimated_delivery !== undefined ? body.estimated_delivery : current.estimated_delivery;
    const notes = body.notes !== undefined ? body.notes : current.notes;

    await env.DB.prepare(`
      UPDATE shipments SET
        awb_number = ?, cargo_type = ?, service_level = ?, origin_hub = ?, destination_city = ?,
        sender_name = ?, receiver_name = ?, pieces = ?, weight_kg = ?, dimensions = ?,
        current_status = ?, estimated_delivery = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      awb_number, cargo_type, service_level, origin_hub, destination_city,
      sender_name, receiver_name, pieces, weight_kg, dimensions,
      current_status, estimated_delivery, notes, id
    ).run();

    return jsonResponse({
      success: true,
      message: 'Shipment updated successfully'
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

// DELETE /api/tracking (Delete Shipment)
export async function onRequestDelete({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    const body = await request.json().catch(() => ({}));
    const id = parseInt(body.id);
    if (!id) return errorResponse('Shipment ID is required', 400);

    await env.DB.prepare('DELETE FROM shipment_checkpoints WHERE shipment_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM shipments WHERE id = ?').bind(id).run();

    return jsonResponse({
      success: true,
      message: 'Shipment and all checkpoints deleted successfully'
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 204);
}
