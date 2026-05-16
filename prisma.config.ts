import { defineConfig } from 'prisma/config'

// Load from .env.local in development, or from environment variables in production
const databaseUrl = process.env.DATABASE_URL || ''

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
})
