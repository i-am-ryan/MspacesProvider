import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  User,
  MapPin,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ProviderSummary {
  provider_id: string;
  profile_id: string;
  business_name: string;
  email: string;
  phone_number: string;
  city: string;
  province: string;
  years_of_experience: number;
  verification_status: string;
  rejection_reason: string | null;
  created_at: string;
  documents_count: number;
  verified_documents_count: number;
}

interface ProviderDetails {
  provider_id: string;
  profile_id: string;
  clerk_user_id: string;
  email: string;
  phone_number: string;
  full_name: string;
  business_name: string;
  business_type: string;
  bio: string;
  business_description: string;
  business_address: string;
  city: string;
  province: string;
  postal_code: string;
  years_of_experience: number;
  verification_status: string;
  rejection_reason: string | null;
  admin_verified: boolean;
  verification_level: number;
  created_at: string;
}

interface ProviderDocument {
  id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  is_verified: boolean;
  verification_status: string;
  verified_at: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminProfileId, setAdminProfileId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedProvider, setSelectedProvider] = useState<ProviderDetails | null>(null);
  const [providerDocuments, setProviderDocuments] = useState<ProviderDocument[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin && !checkingAdmin) {
      loadProviders(activeTab);
    }
  }, [isAdmin, checkingAdmin, activeTab]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      // Get profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Profile not found');
        setIsAdmin(false);
        setCheckingAdmin(false);
        navigate('/home');
        return;
      }

      setAdminProfileId(profileData.id);

      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('profile_id', profileData.id)
        .maybeSingle();

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error checking admin status:', adminError);
      }

      if (adminData) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate('/home');
      }
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
      navigate('/home');
    } finally {
      setCheckingAdmin(false);
    }
  };

  const loadProviders = async (status: string) => {
    setLoading(true);
    try {
      const statusMap: { [key: string]: string } = {
        pending: 'under_review',
        approved: 'approved',
        rejected: 'rejected',
      };

      const { data, error } = await supabase.rpc('get_providers_by_status', {
        p_status: statusMap[status],
      });

      if (error) throw error;

      setProviders(data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load providers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProviderDetails = async (providerId: string) => {
    try {
      // Get provider details
      const { data: detailsData, error: detailsError } = await supabase.rpc(
        'get_provider_review_details',
        { p_provider_id: providerId }
      );

      if (detailsError) throw detailsError;

      if (detailsData && detailsData.length > 0) {
        setSelectedProvider(detailsData[0]);
      }

      // Get provider documents
      const { data: docsData, error: docsError } = await supabase
        .from('provider_documents')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      setProviderDocuments(docsData || []);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Error loading provider details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load provider details',
        variant: 'destructive',
      });
    }
  };

  const handleViewDocument = async (document: ProviderDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('provider-documents')
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadDocument = async (doc: ProviderDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('provider-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.document_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const handlePrintDocuments = () => {
    window.print();
  };

  const handleApproveProvider = async () => {
    if (!selectedProvider || !adminProfileId) return;

    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('admin_verify_provider', {
        p_provider_id: selectedProvider.provider_id,
        p_admin_profile_id: adminProfileId,
        p_approved: true,
        p_rejection_reason: null,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Provider has been approved and can now accept jobs',
      });

      setShowDetailsDialog(false);
      loadProviders(activeTab);
    } catch (error) {
      console.error('Error approving provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve provider',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectProvider = async () => {
    if (!selectedProvider || !adminProfileId || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.rpc('admin_verify_provider', {
        p_provider_id: selectedProvider.provider_id,
        p_admin_profile_id: adminProfileId,
        p_approved: false,
        p_rejection_reason: rejectionReason,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Provider application has been rejected',
      });

      setShowRejectDialog(false);
      setShowDetailsDialog(false);
      setRejectionReason('');
      loadProviders(activeTab);
    } catch (error) {
      console.error('Error rejecting provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject provider',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDocumentType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Provider Verification</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{activeTab === 'pending' ? providers.length : '-'}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{activeTab === 'approved' ? providers.length : '-'}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </Card>
          <Card className="p-4 text-center">
            <XCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold">{activeTab === 'rejected' ? providers.length : '-'}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3 mt-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading providers...</p>
              </div>
            ) : providers.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 opacity-50 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-muted-foreground">No {activeTab} applications</p>
              </Card>
            ) : (
              providers.map((provider) => (
                <Card
                  key={provider.provider_id}
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => loadProviderDetails(provider.provider_id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{provider.business_name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.email}</p>
                    </div>
                    <Badge
                      variant={
                        provider.verification_status === 'approved'
                          ? 'default'
                          : provider.verification_status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {provider.verification_status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {provider.city}, {provider.province}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span>{provider.years_of_experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>
                        {provider.verified_documents_count}/{provider.documents_count} documents
                        verified
                      </span>
                    </div>
                    {provider.rejection_reason && (
                      <div className="flex items-start gap-2 text-destructive mt-2 p-2 bg-destructive/10 rounded">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{provider.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Provider Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Application Review</DialogTitle>
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-6">
              {/* Business Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Business Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-muted-foreground">Business Name</p>
                      <p className="font-medium">{selectedProvider.business_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Business Type</p>
                      <p className="font-medium">{selectedProvider.business_type || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Description</p>
                    <p className="font-medium">
                      {selectedProvider.business_description || selectedProvider.bio || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Experience</p>
                    <p className="font-medium">{selectedProvider.years_of_experience} years</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedProvider.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedProvider.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedProvider.phone_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedProvider.business_address || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-muted-foreground">City</p>
                      <p className="font-medium">{selectedProvider.city}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Province</p>
                      <p className="font-medium">{selectedProvider.province}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Postal Code</p>
                    <p className="font-medium">{selectedProvider.postal_code || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Submitted Documents ({providerDocuments.length})
                  </h3>
                  <Button variant="outline" size="sm" onClick={handlePrintDocuments}>
                    <Download className="w-4 h-4 mr-1" />
                    Print All
                  </Button>
                </div>
                <div className="space-y-2">
                  {providerDocuments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No documents submitted yet
                    </p>
                  ) : (
                    providerDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {formatDocumentType(doc.document_type)}
                            </p>
                            <p className="text-xs text-muted-foreground">{doc.document_name}</p>
                          </div>
                          {doc.is_verified && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedProvider.verification_status === 'under_review' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={processing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleApproveProvider}
                    disabled={processing}
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Approve Provider
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Provider Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a detailed reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be shown to the provider
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectProvider}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;