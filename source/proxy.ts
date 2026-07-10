import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const ADMIN_ACCESS_COOKIE = 'jmk-admin-access'
const TOKEN_QUERY_PARAM = 'token'

function decodeToken(token: string) {
  try {
    const normalizedToken = token.replace(/-/g, '+').replace(/_/g, '/')
    const paddedToken = normalizedToken.padEnd(normalizedToken.length + ((4 - (normalizedToken.length % 4)) % 4), '=')

    return atob(paddedToken)
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  if (request.cookies.get(ADMIN_ACCESS_COOKIE)?.value === '1') {
    return NextResponse.next()
  }

  const token = request.nextUrl.searchParams.get(TOKEN_QUERY_PARAM)
  const decodedToken = token ? decodeToken(token) : null

  if (decodedToken?.includes('JMK')) {
    const cleanUrl = request.nextUrl.clone()
    cleanUrl.searchParams.delete(TOKEN_QUERY_PARAM)

    const response = NextResponse.redirect(cleanUrl)
    response.cookies.set({
      name: ADMIN_ACCESS_COOKIE,
      value: '1',
      httpOnly: true,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      path: '/admin',
    })

    return response
  }

  return new NextResponse(null, { status: 404 })
}

export const config = {
  matcher: ['/admin/:path*'],
}
