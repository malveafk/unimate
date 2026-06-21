import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()

    const { data, error } = await supabase
        .from('logs')
        .insert([{ action: body.action, ip: body.ip }])
        .select()

    if (error) return Response.json({ error })
    return Response.json(data)
}