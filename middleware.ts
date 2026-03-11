import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas: siempre permitidas
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar si hay refresh token en localStorage no es posible desde middleware
  // (middleware corre en el edge, sin acceso a localStorage).
  // La protección real la hace el AuthContext con isLoading + redirect.
  // Aquí solo protegemos rutas que no sean API ni archivos estáticos.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
