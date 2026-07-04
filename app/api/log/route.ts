import { logAction } from '@/utils/log'

export async function POST(request: Request) {
    const body = await request.json().catch(() => null)

    if (!body || typeof body.action !== 'string' || body.action.length === 0 || body.action.length > 100) {
        return Response.json({ error: 'Invalid action.' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

    const ok = await logAction(body.action, ip)
    if (!ok) return Response.json({ error: 'Failed to log action.' }, { status: 500 })
    return Response.json({ ok: true })
}