import { supabase } from './supabase';

export interface PendingProvider {
  provider_id: string;
  profile_id: string;
  business_name: string;
  email: string;
  phone_number: string;
  city: string;
  province: string;
  years_of_experience: number;
  created_at: string;
  documents_count: number;
  verified_documents_count: number;
}

export interface ProviderDocument {
  document_id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    // First get the profile ID from clerk_user_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profileData) {
      console.error('Profile not found:', profileError);
      return false;
    }

    // Check if profile_id exists in admin_users
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('profile_id', profileData.id)
      .single();

    if (error) {
      console.error('Admin check error:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Exception in isUserAdmin:', error);
    return false;
  }
}

export async function getPendingProviders(): Promise<PendingProvider[]> {
  const { data, error } = await supabase.rpc('get_providers_pending_verification');

  if (error) {
    console.error('Error fetching pending providers:', error);
    return [];
  }

  return data || [];
}

export async function getProviderDocuments(providerId: string): Promise<ProviderDocument[]> {
  const { data, error } = await supabase.rpc('get_provider_documents_for_review', {
    p_provider_id: providerId,
  });

  if (error) {
    console.error('Error fetching provider documents:', error);
    return [];
  }

  return data || [];
}

export async function verifyProvider(
  providerId: string,
  adminProfileId: string,
  verified: boolean
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('verify_provider', {
    p_provider_id: providerId,
    p_admin_profile_id: adminProfileId,
    p_verified: verified,
  });

  if (error) {
    console.error('Error verifying provider:', error);
    throw error;
  }

  return data;
}

export async function verifyDocument(
  documentId: string,
  adminProfileId: string,
  verified: boolean,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('verify_document', {
    p_document_id: documentId,
    p_admin_profile_id: adminProfileId,
    p_verified: verified,
    p_notes: notes || null,
  });

  if (error) {
    console.error('Error verifying document:', error);
    throw error;
  }

  return data;
}

export async function getProviderDetails(providerId: string) {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      profiles:profile_id (
        full_name,
        email,
        phone_number
      )
    `)
    .eq('id', providerId)
    .single();

  if (error) {
    console.error('Error fetching provider details:', error);
    return null;
  }

  return data;
}