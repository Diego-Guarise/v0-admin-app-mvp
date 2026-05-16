import { NextResponse } from 'next/server'

// Simple health check that doesn't require direct DB connection during build
export async function GET() {
  try {
    // For now, just verify the env var is available
    const hasDbUrl = !!process.env.DATABASE_URL
    
    if (!hasDbUrl) {
      return NextResponse.json(
        {
          status: 'error',
          database: 'disconnected',
          error: 'DATABASE_URL not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        database: 'configured',
        timestamp: new Date().toISOString(),
        message: 'Database connection string is available',
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      {
        status: 'error',
        database: 'error',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

