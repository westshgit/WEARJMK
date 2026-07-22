import { loadEnvConfig } from '@next/env'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import { redirects } from './redirects'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const DEV = process.env.NODE_ENV !== 'production'

const { loadedEnvFiles, parsedEnv } = loadEnvConfig(path.resolve(dirname, '../'), DEV, console, true, (envFilePath) => {
  console.log(`Reloaded environment variables from ${envFilePath}`)
})

if (!parsedEnv) {
  throw new Error('Failed to load environment variables.')
}

if (DEV) {
  console.log('Loaded environment variables:', parsedEnv)
  loadedEnvFiles.forEach((file) => {
    console.log(`Loaded environment variables from ${file.path}`)
  })
}

const serverURLs = [NEXT_PUBLIC_SERVER_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.0.15:3000'].filter(Boolean)
const nextConfig: NextConfig = {
  output: 'standalone',
  // See: https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/media/**',
      },
    ],
    qualities: [90, 100],
    remotePatterns: serverURLs.map((item) => {
      const url = new URL(item)

      return {
        protocol: url.protocol.replace(':', '') as 'http' | 'https',
        hostname: url.hostname,
        port: url.port,
      }
    }),
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.0.15'],
  reactStrictMode: true,
  redirects,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  devIndicators: {
    position: 'bottom-left',
  },
}

export default withPayload(nextConfig)
