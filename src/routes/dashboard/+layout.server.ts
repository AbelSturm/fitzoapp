import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  console.log('Loading dashboard...');
  const session = await locals.getSession();
  console.log('Session data:', session);

  // Re-enable session check
  if (!session) {
    console.warn('No session found, redirecting to login.');
    throw redirect(303, '/login');
  }

  try {
    // Get user profile with role
    const { data: profileData, error } = await locals.supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id);
    
    console.log('Profile data:', profileData);
    console.log('Profile error:', error);

    // Handle database errors - user might have been deleted
    if (error) {
      console.warn('Error fetching profile, user might have been deleted:', error.message);
      // Sign out the user
      await locals.supabase.auth.signOut();
      throw redirect(303, '/login');
    }

    // Re-enable profile check
    if (!profileData || profileData.length === 0) {
      console.warn('No profile found, redirecting to login.');
      await locals.supabase.auth.signOut();
      throw redirect(303, '/login');
    }
    
    const profile = profileData[0];
    
    // Check if user has no role assigned
    if (!profile.role) {
      console.warn('User has no role assigned, signing out and redirecting to home.');
      // Sign out the user
      await locals.supabase.auth.signOut();
      throw redirect(303, '/');
    }

    return {
      session,
      profile
    };
  } catch (err) {
    console.error('Unexpected error in dashboard layout:', err);
    // Sign out and redirect in case of any unexpected errors
    await locals.supabase.auth.signOut();
    throw redirect(303, '/login');
  }
};