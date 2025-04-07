// @ts-nocheck
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, locals }: Parameters<LayoutServerLoad>[0]) => {
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    url.pathname.startsWith(route)
  );

  console.log('Route check:', { path: url.pathname, isProtected: isProtectedRoute, hasSession: !!locals.session });

  // Re-enable protection
  if (isProtectedRoute && !locals.session) {
    throw redirect(303, '/login');
  }

  return {
    session: locals.session
  };
};