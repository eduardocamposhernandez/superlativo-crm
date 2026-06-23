import { NextResponse, type NextRequest } from "next/server";

const RUTAS_PUBLICAS = ["/", "/login", "/agenda-publica"];
const PREFIJOS_PUBLICOS = ["/agenda/", "/api/landing", "/api/auth/login", "/_next", "/favicon"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas siempre públicas
  if (
    RUTAS_PUBLICAS.includes(pathname) ||
    PREFIJOS_PUBLICOS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/icon")
  ) {
    return NextResponse.next();
  }

  // Resto: la sesión real se valida en server components / APIs.
  // El middleware solo es una primera línea de redirección amable.
  const tieneCookie = req.cookies.has("superlativo_sesion");
  if (!tieneCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.svg|manifest.json|icon-.*\\.png).*)",
  ],
};
