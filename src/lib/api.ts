import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface ProviderProfileData {
  profile_id: string;
  business_name: string;
  bio: string;
  years_of_experience: number;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  service_radius_km: number;
}

export interface QuoteData {
  request_id: string;
  provider_id: string;
  quoted_price: number;
  call_out_fee: number;
  estimated_duration: string;
  description: string;
  valid_until: string;
}

export interface PortfolioItem {
  provider_id: string;
  title: string;
  description: string;
  images: string[];
  category_id: string;
}

export interface AvailabilitySlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// 1. Create/Update Provider Profile
export async function createProviderProfile(data: ProviderProfileData) {
  // First create the location geometry
  const locationPoint = `POINT(${data.longitude} ${data.latitude})`;
  
  const { data: profile, error } = await supabase
    .from('provider_profiles')
    .insert([{
      ...data,
      location: locationPoint,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return profile;
}

export async function updateProviderProfile(providerId: string, data: Partial<ProviderProfileData>) {
  const updateData: any = { ...data };
  
  // Update location if coordinates changed
  if (data.latitude && data.longitude) {
    updateData.location = `POINT(${data.longitude} ${data.latitude})`;
  }
  
  const { data: profile, error } = await supabase
    .from('provider_profiles')
    .update(updateData)
    .eq('id', providerId)
    .select()
    .single();
  
  if (error) throw error;
  return profile;
}

// 2. Upload Verification Document
export async function uploadDocument(
  providerId: string,
  docType: string,
  file: File
) {
  // Upload to storage
  const timestamp = Date.now();
  const filePath = `${providerId}/${docType}/${timestamp}_${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('provider-documents')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  // Create document record
  const { data, error } = await supabase
    .from('provider_documents')
    .insert([{
      provider_id: providerId,
      document_type: docType,
      document_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 3. Get Nearby Service Requests
export async function getNearbyRequests(
  providerId: string,
  maxDistanceKm: number = 50
) {
  // First get provider's location and services
  const { data: provider } = await supabase
    .from('provider_profiles')
    .select('latitude, longitude, provider_services(category_id)')
    .eq('id', providerId)
    .single();
  
  if (!provider) throw new Error('Provider not found');
  
  // Get service requests within radius (simplified - in production use PostGIS function)
  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      service_categories(name, icon, color),
      customer_profiles(
        profile_id(full_name, avatar_url)
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) throw error;
  return data;
}

// 4. Create Quote
export async function createQuote(quote: QuoteData) {
  const { data, error } = await supabase
    .from('service_quotes')
    .insert([{
      ...quote,
      status: 'pending'
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  // Create notification for customer
  const { data: request } = await supabase
    .from('service_requests')
    .select('customer_id')
    .eq('id', quote.request_id)
    .single();
  
  if (request) {
    await supabase
      .from('notifications')
      .insert([{
        profile_id: request.customer_id,
        title: 'New Quote Received',
        message: 'A provider has sent you a quote for your service request',
        type: 'booking',
        reference_id: data.id,
        is_read: false
      }]);
  }
  
  return data;
}

// 5. Get Provider Bookings
export async function getProviderBookings(providerId: string, status?: string) {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      service_requests (
        title,
        description,
        address,
        city,
        images,
        service_categories (name, icon, color)
      ),
      customer_profiles!bookings_customer_id_fkey (
        id,
        profile_id (
          full_name,
          phone_number,
          avatar_url
        )
      )
    `)
    .eq('provider_id', providerId)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

// 6. Update Booking Status
export async function updateBookingStatus(
  bookingId: string,
  status: string,
  notes?: string
) {
  const updateData: any = { status };
  
  if (status === 'in_progress') {
    updateData.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
    if (notes) {
      updateData.completion_notes = notes;
    }
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Send notification to customer
  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_id')
    .eq('id', bookingId)
    .single();
  
  if (booking) {
    await supabase
      .from('notifications')
      .insert([{
        profile_id: booking.customer_id,
        title: `Booking ${status}`,
        message: `Your booking has been updated to ${status}`,
        type: 'booking',
        reference_id: bookingId,
        is_read: false
      }]);
  }
  
  return data;
}

// 7. Get Provider Stats
export async function getProviderStats(providerId: string) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const [bookings, reviews, weekEarnings, profile] = await Promise.all([
    supabase
      .from('bookings')
      .select('status, total_amount, scheduled_date')
      .eq('provider_id', providerId),
    
    supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', providerId),
    
    supabase
      .from('bookings')
      .select('total_amount')
      .eq('provider_id', providerId)
      .eq('status', 'completed')
      .gte('completed_at', startOfWeek.toISOString()),
    
    supabase
      .from('provider_profiles')
      .select('average_rating, total_reviews, total_jobs_completed')
      .eq('id', providerId)
      .single()
  ]);
  
  const activeBookings = bookings.data?.filter(
    b => b.status === 'confirmed' || b.status === 'in_progress'
  ) || [];
  
  const todayBookings = bookings.data?.filter(
    b => b.scheduled_date === today.toISOString().split('T')[0]
  ) || [];
  
  const weekTotal = weekEarnings.data?.reduce(
    (sum, b) => sum + Number(b.total_amount || 0),
    0
  ) || 0;
  
  return {
    total_jobs: profile.data?.total_jobs_completed || 0,
    active_bookings: activeBookings.length,
    today_bookings: todayBookings.length,
    average_rating: profile.data?.average_rating || 0,
    total_reviews: profile.data?.total_reviews || 0,
    week_earnings: weekTotal,
    completion_rate: 95 // Calculate from actual data
  };
}

// 8. Add Portfolio Item
export async function addPortfolioItem(item: PortfolioItem) {
  const { data, error } = await supabase
    .from('provider_portfolio')
    .insert([item])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 9. Upload Portfolio Image
export async function uploadPortfolioImage(providerId: string, file: File) {
  const timestamp = Date.now();
  const filePath = `${providerId}/portfolio/${timestamp}_${file.name}`;
  
  const { error: uploadError, data } = await supabase.storage
    .from('portfolio-images')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(filePath);
  
  return publicUrl;
}

// 10. Set Availability
export async function setAvailability(
  providerId: string,
  schedule: AvailabilitySlot[]
) {
  // Delete existing
  await supabase
    .from('provider_availability')
    .delete()
    .eq('provider_id', providerId);
  
  // Insert new schedule
  const { data, error } = await supabase
    .from('provider_availability')
    .insert(
      schedule.map(slot => ({
        provider_id: providerId,
        ...slot
      }))
    );
  
  if (error) throw error;
  return data;
}

// 11. Get Provider's Quotes
export async function getProviderQuotes(providerId: string) {
  const { data, error } = await supabase
    .from('service_quotes')
    .select(`
      *,
      service_requests (
        title,
        description,
        address,
        service_categories (name, icon),
        customer_profiles (
          profile_id (full_name, avatar_url)
        )
      )
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// 12. Get Provider Services
export async function getProviderServices(providerId: string) {
  const { data, error } = await supabase
    .from('provider_services')
    .select(`
      *,
      service_categories (*)
    `)
    .eq('provider_id', providerId);
  
  if (error) throw error;
  return data;
}

// 13. Add Provider Service
export async function addProviderService(
  providerId: string,
  categoryId: string,
  pricing: {
    base_price?: number;
    call_out_fee?: number;
    hourly_rate?: number;
  }
) {
  const { data, error } = await supabase
    .from('provider_services')
    .insert([{
      provider_id: providerId,
      category_id: categoryId,
      ...pricing,
      is_active: true
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 14. Get all service categories
export async function getServiceCategories() {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

// 15. Create user profile in Supabase
export async function createUserProfile(clerkUserId: string, email: string, fullName: string, userType: 'customer' | 'provider') {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      clerk_user_id: clerkUserId,
      email: email,
      full_name: fullName,
      user_type: userType
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// 16. Get profile by Clerk ID
export async function getProfileByClerkId(clerkUserId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (error) throw error;
  return data;
}

// 17. Get provider profile
export async function getProviderProfile(profileId: string) {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('profile_id', profileId)
    .single();
  
  if (error) throw error;
  return data;
}