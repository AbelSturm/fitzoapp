import type { LayoutLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

export const load: LayoutLoad = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  return {
    session
  };
};