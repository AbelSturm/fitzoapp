import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key: string) => event.cookies.get(key),
        set: (key: string, value: string, options?: Record<string, any>) => {
          event.cookies.set(key, value, {
            ...options,
            path: '/'
          });
        },
        remove: (key: string, options?: Record<string, any>) => {
          event.cookies.delete(key, {
            ...options,
            path: '/'
          });
        }
      }
    }
  );

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    return session;
  };

  event.locals.session = await event.locals.getSession();

  return resolve(event);
};