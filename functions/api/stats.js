import { authenticateRequest, jsonResponse, errorResponse } from '../utils/crypto.js';

export async function onRequestGet({ request, env }) {
  try {
    const user = await authenticateRequest(request);
    if (!user) return errorResponse('Unauthorized: Admin access required', 401);
    if (!env.DB) return errorResponse('Database binding not configured', 500);

    // Run parallel counts for fast KPI dashboard load
    const [
      totalShipments,
      activeShipments,
      deliveredShipments,
      pendingQuotes,
      newInquiries,
      recentShipments,
      recentQuotes,
      recentInquiries
    ] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as count FROM shipments').first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM shipments WHERE current_status NOT IN ('DELIVERED', 'EXCEPTION')").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM shipments WHERE current_status = 'DELIVERED'").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM quote_requests WHERE status = 'PENDING'").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM contact_inquiries WHERE status = 'NEW'").first(),
      env.DB.prepare('SELECT id, awb_number, cargo_type, origin_hub, destination_city, current_status, created_at FROM shipments ORDER BY created_at DESC LIMIT 5').all(),
      env.DB.prepare('SELECT id, name, mobile, service_type, origin, destination, status, created_at FROM quote_requests ORDER BY created_at DESC LIMIT 5').all(),
      env.DB.prepare('SELECT id, name, email, subject, service_of_interest, status, created_at FROM contact_inquiries ORDER BY created_at DESC LIMIT 5').all()
    ]);

    return jsonResponse({
      success: true,
      stats: {
        total_shipments: totalShipments?.count || 0,
        active_shipments: activeShipments?.count || 0,
        delivered_shipments: deliveredShipments?.count || 0,
        pending_quotes: pendingQuotes?.count || 0,
        new_inquiries: newInquiries?.count || 0
      },
      recent: {
        shipments: recentShipments?.results || [],
        quotes: recentQuotes?.results || [],
        inquiries: recentInquiries?.results || []
      }
    });
  } catch (err) {
    return errorResponse(`Server error: ${err.message}`, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 204);
}
