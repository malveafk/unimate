import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    const body = await request.json().catch(() => null)

    if (!body || typeof body.action !== 'string' || body.action.length === 0 || body.action.length > 100) {
        return Response.json({ error: 'Invalid action.' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
        .from('logs')
        .insert([{ action: body.action, ip }])
        .select()

    if (error) {
        console.error('Failed to write log:', error.message)
        return Response.json({ error: 'Failed to log action.' }, { status: 500 })
    }
    return Response.json(data)
}