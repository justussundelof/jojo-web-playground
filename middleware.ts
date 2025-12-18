import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Get user session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Define protected route patterns
    const protectedRoutes = ["/checkout", "/profile"];
    const adminRoutes = ["/admin"];

    // Check if path matches admin routes
    if (adminRoutes.some(route => path.startsWith(route))) {
        if (!user) {
            // Store intended path and redirect to home (login modal will handle from there)
            const redirectUrl = new URL("/", request.url);
            redirectUrl.searchParams.set("redirectTo", path);
            return NextResponse.redirect(redirectUrl);
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            // Redirect to home if not admin
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // Check if path matches protected routes (any authenticated user)
    if (protectedRoutes.some(route => path.startsWith(route))) {
        if (!user) {
            // Store intended path and redirect to home
            const redirectUrl = new URL("/", request.url);
            redirectUrl.searchParams.set("redirectTo", path);
            return NextResponse.redirect(redirectUrl);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};