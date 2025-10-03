import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Esta línea es crucial. Refresca la sesión y obtiene los datos del usuario.
  const { data: { user } } = await supabase.auth.getUser()

  // Lógica de protección de rutas
  const protectedPaths = ['/dashboard', '/projects'] // <-- Define aquí tus rutas protegidas
  const currentPath = request.nextUrl.pathname

  // Si el usuario no está autenticado y trata de acceder a una ruta protegida...
  if (!user && protectedPaths.some(path => currentPath.startsWith(path))) {
    // ...lo redirigimos a la página de login.
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Si el usuario ya está autenticado y trata de ir a la página de login...
  if (user && currentPath.startsWith('/auth/login')) {
    // ...lo redirigimos a la página principal o al dashboard.
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}