import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Never prerender/cache: this must run at request time against the live DB
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Real query against Neon via Prisma. count() is safe and cheap.
    await db.healthCheck.count()

    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    // Log full error server-side for debugging, but never leak it (may contain the connection string)
    console.error('[v0] db-health check failed:', error)

    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        message: 'Database health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
