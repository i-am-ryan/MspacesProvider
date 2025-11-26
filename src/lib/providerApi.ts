import { supabase } from './supabase';

export interface ProviderStats {
  jobs_completed: number;
  average_rating: number;
  monthly_earnings: number;
  active_jobs: number;
  pending_requests: number;
}

export interface RecentActivity {
  booking_id: string;
  customer_name: string;
  service_name: string;
  status: string;
  total_amount: number;
  rating: number | null;
  completed_at: string | null;
  scheduled_date: string;
}

export interface ProviderProfile {
  id: string;
  profile_id: string;
  business_name: string | null;
  bio: string | null;
  business_address: string | null;
  business_website: string | null;
  business_description: string | null;
  years_of_experience: number | null;
  city: string | null;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
  service_radius_km: number;
  is_accepting_jobs: boolean;
  is_verified: boolean;
  admin_verified: boolean;
  average_rating: number;
  total_reviews: number;
  total_jobs_completed: number;
  verification_level: number;
}

export async function getProviderProfile(clerkUserId: string): Promise<ProviderProfile | null> {
  try {
    // First, get the profile ID from the profiles table using clerk_user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle(); // Use maybeSingle to avoid 406 errors

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    if (!profileData) {
      console.log('No profile found for clerk user:', clerkUserId);
      return null;
    }

    // Now get the provider profile using the profile_id
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('profile_id', profileData.id)
      .maybeSingle(); // Use maybeSingle to avoid 406 errors

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching provider profile:', error);
      return null;
    }

    if (!data) {
      console.log('No provider profile found yet for profile_id:', profileData.id);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getProviderProfile:', error);
    return null;
  }
}

export async function getProviderDashboardStats(providerId: string): Promise<ProviderStats | null> {
  const { data, error } = await supabase.rpc('get_provider_dashboard_stats', {
    p_provider_id: providerId,
  });

  if (error) {
    console.error('Error fetching provider stats:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}

export async function getProviderRecentActivity(
  providerId: string,
  limit: number = 5
): Promise<RecentActivity[]> {
  const { data, error } = await supabase.rpc('get_provider_recent_activity', {
    p_provider_id: providerId,
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return data || [];
}

export async function toggleProviderAvailability(
  providerId: string,
  isAccepting: boolean
): Promise<{ success: boolean; message: string; is_accepting_jobs: boolean }> {
  const { data, error } = await supabase.rpc('toggle_provider_availability', {
    p_provider_id: providerId,
    p_is_accepting: isAccepting,
  });

  if (error) {
    console.error('Error toggling availability:', error);
    throw error;
  }

  return data;
}

export async function updateProviderProfile(
  providerId: string,
  updates: Partial<ProviderProfile>
): Promise<ProviderProfile | null> {
  console.log('Updating provider profile:', providerId, updates);
  
  const { data, error } = await supabase
    .from('provider_profiles')
    .update(updates)
    .eq('id', providerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating provider profile:', error);
    console.error('Provider ID:', providerId);
    console.error('Updates:', updates);
    throw error;
  }

  return data;
}

export async function updateProviderLocation(
  providerId: string,
  latitude: number,
  longitude: number,
  serviceRadiusKm: number,
  address: string,
  city: string,
  province: string
): Promise<void> {
  const { error } = await supabase.rpc('update_provider_location', {
    p_provider_id: providerId,
    p_latitude: latitude,
    p_longitude: longitude,
    p_service_radius_km: serviceRadiusKm,
    p_address: address,
    p_city: city,
    p_province: province,
  });

  if (error) {
    console.error('Error updating provider location:', error);
    throw error;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}