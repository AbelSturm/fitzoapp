// @ts-nocheck
import type { LayoutLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

export const load = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  return {
    session
  };
};;null as any as LayoutLoad;