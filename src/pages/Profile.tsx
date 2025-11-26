import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { 
  ArrowLeft, Mail, AlertCircle, Briefcase, MapPin, CheckCircle, Upload, 
  FileText, Building2,
  Check, X, Clock
} from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { ServiceAutocomplete } from '@/components/ServiceAutocomplete';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [mainProfile, setMainProfile] = useState<any>(null);
  const [checklist, setChecklist] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingDocs, setSubmittingDocs] = useState(false);
  const [activeTab, setActiveTab] = useState('business');
  
  // Document uploads - store files locally until submit
  const [pendingDocuments, setPendingDocuments] = useState<{
    [key: string]: File | null;
  }>({
    company_registration: null,
    tax_clearance: null,
    id_document: null,
    proof_of_address: null,
    bank_statement: null,
    company_profile: null,
  });
  
  // Business Info
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [businessType, setBusinessType] = useState('');
  
  // Address Info
  const [businessAddress, setBusinessAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Services
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [primaryService, setPrimaryService] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) {
      console.error("❌ No user!");
      return;
    }

    console.log("=== LOADING PROFILE ===");
    console.log("Clerk User ID:", user.id);

    try {
      console.log("Step 1: Getting main profile...");
      const { data: mainProfileData, error: mainError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .maybeSingle();

      console.log("Main profile result:", { mainProfileData, mainError });

      if (mainProfileData) {
        setMainProfile(mainProfileData);
        console.log("✅ Main profile loaded");
        
        console.log("Step 2: Getting provider profile...");
        const { data: providerData, error: providerError } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('profile_id', mainProfileData.id)
          .maybeSingle();

        console.log("Provider profile result:", { providerData, providerError });

        if (providerData) {
          console.log("✅ Provider profile loaded:", providerData);
          setProfile(providerData);
          
          // Load form fields
          setBusinessName(providerData.business_name || '');
          setBio(providerData.bio || '');
          setBusinessDescription(providerData.business_description || '');
          setYearsOfExperience(providerData.years_of_experience?.toString() || '');
          setBusinessWebsite(providerData.business_website || '');
          setBusinessType(providerData.business_type || '');
          setBusinessAddress(providerData.business_address || '');
          setCity(providerData.city || '');
          setProvince(providerData.province || '');
          setPostalAddress(providerData.postal_address || '');
          setPostalCode(providerData.postal_code || '');
          
          console.log("Step 3: Loading checklist and documents...");
          
          // Load checklist
          const { data: checklistData } = await supabase
            .from('provider_verification_checklist')
            .select('*')
            .eq('provider_id', providerData.id)
            .maybeSingle();
          
          setChecklist(checklistData);
          console.log("Checklist:", checklistData);
          
          // Load documents
          const { data: docsData } = await supabase
            .from('provider_documents')
            .select('*')
            .eq('provider_id', providerData.id)
            .order('created_at', { ascending: false });
          
          setDocuments(docsData || []);
          console.log("Documents:", docsData?.length || 0);

          // Load services
          const { data: providerServices } = await supabase
            .from('provider_services')
            .select('category_id, is_primary')
            .eq('provider_id', providerData.id);
          
          if (providerServices && providerServices.length > 0) {
            setSelectedServices(providerServices.map(ps => ps.category_id));
            console.log("Services loaded:", providerServices.length);
          }
          
          console.log("=== ✅ PROFILE LOAD COMPLETE ===");
        } else {
          console.error("❌ NO PROVIDER PROFILE FOUND for profile_id:", mainProfileData.id);
        }
      } else {
        console.error("❌ NO MAIN PROFILE FOUND for clerk_user_id:", user.id);
      }
    } catch (error) {
      console.error("❌ ERROR LOADING PROFILE:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!profile) {
      console.error("NO PROFILE!");
      return;
    }

    console.log("=== SAVE BUTTON CLICKED ===");
    console.log("Provider Profile ID:", profile.id);
    
    setSaving(true);
    
    try {
      console.log("Saving to provider_profiles table...");
      console.log("Data:", {
        business_name: businessName,
        business_type: businessType,
        bio: bio,
        business_description: businessDescription,
        years_of_experience: yearsOfExperience,
        business_website: businessWebsite,
      });

      const { data, error } = await supabase
        .from('provider_profiles')
        .update({
          business_name: businessName,
          business_type: businessType,
          bio: bio,
          business_description: businessDescription || null,
          years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          business_website: businessWebsite || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select();

      if (error) {
        console.error("❌ SAVE ERROR:", error);
        throw error;
      }

      console.log("✅ SAVED:", data);

      // Save services
      if (selectedServices.length > 0) {
        await supabase.from('provider_services').delete().eq('provider_id', profile.id);
        
        const servicesToInsert = selectedServices.map(categoryId => ({
          provider_id: profile.id,
          category_id: categoryId,
          is_primary: selectedServices[0] === categoryId,
        }));

        await supabase.from('provider_services').insert(servicesToInsert);
      }

      toast({
        title: "Success!",
        description: "Business information saved.",
      });

      await loadProfile();
      setActiveTab('location');
      
    } catch (error: any) {
      console.error("SAVE FAILED:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddressInfo = async () => {
    if (!profile) return;

    setSaving(true);
    
    try {
      console.log("Saving address...");
      
      const { data, error } = await supabase
        .from('provider_profiles')
        .update({
          business_address: businessAddress || null,
          city: city || null,
          province: province || null,
          postal_address: postalAddress || null,
          postal_code: postalCode || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select();

      if (error) throw error;

      console.log("✅ Address saved:", data);

      toast({
        title: "Success!",
        description: "Location saved.",
      });

      await loadProfile();
      setActiveTab('documents');
      
    } catch (error: any) {
      console.error("Address save error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max 10MB per file",
        variant: "destructive",
      });
      return;
    }

    // Store file locally
    setPendingDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));

    toast({
      title: "File selected",
      description: `${file.name} ready to upload`,
    });
  };

  const handleSubmitDocuments = async () => {
    if (!profile) return;

    const filesToUpload = Object.entries(pendingDocuments).filter(([_, file]) => file !== null);
    
    if (filesToUpload.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to upload",
        variant: "destructive",
      });
      return;
    }

    setSubmittingDocs(true);

    try {
      console.log(`Uploading ${filesToUpload.length} documents...`);

      for (const [docType, file] of filesToUpload) {
        if (!file) continue;

        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}/${docType}/${Date.now()}.${fileExt}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('provider-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('provider-documents')
          .getPublicUrl(fileName);

        // Create document record
        await supabase
          .from('provider_documents')
          .insert({
            provider_id: profile.id,
            document_type: docType,
            document_name: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type,
            is_verified: false,
          });
      }

      // Update checklist
      await supabase
        .from('provider_verification_checklist')
        .update({
          profile_completed: true,
          profile_completed_at: new Date().toISOString(),
          verification_status: 'under_review',
        })
        .eq('provider_id', profile.id);

      toast({
        title: "Documents Submitted! 🎉",
        description: "You can now access the dashboard.",
      });

      // Navigate to home after 1.5 seconds
      setTimeout(() => navigate('/home'), 1500);

    } catch (error: any) {
      console.error("Document upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmittingDocs(false);
    }
  };

  const getDocumentStatus = (docType: string) => {
    const doc = documents.find(d => d.document_type === docType);
    if (!doc) return null;
    if (doc.is_verified) return 'approved';
    if (doc.verification_status) return doc.verification_status;
    return 'pending';
  };

  const allDocumentsSelected = () => {
    return Object.values(pendingDocuments).every(file => file !== null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {user?.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user?.fullName}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name *</Label>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="ABC Services"
                    />
                  </div>
                  <div>
                    <Label>Business Type *</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                        <SelectItem value="pty_ltd">Pty Ltd</SelectItem>
                        <SelectItem value="cc">CC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Short Bio *</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief introduction"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="Detailed description"
                    rows={3}
                  />
                </div>

                <ServiceAutocomplete
                  value={primaryService}
                  onChange={(name, id) => {
                    setPrimaryService(name);
                    if (id) setSelectedServices([id]);
                  }}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Years of Experience *</Label>
                    <Input
                      type="number"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={businessWebsite}
                      onChange={(e) => setBusinessWebsite(e.target.value)}
                      placeholder="https://yoursite.com"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveBusinessInfo}
                  disabled={saving || !businessName || !businessType || !bio || !yearsOfExperience}
                  className="w-full"
                  size="lg"
                >
                  {saving ? 'Saving...' : 'Save Business Information'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Business Address</Label>
                  <Input
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Johannesburg"
                    />
                  </div>
                  <div>
                    <Label>Province *</Label>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gauteng">Gauteng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="2196"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveAddressInfo}
                  disabled={saving || !city}
                  className="w-full"
                  size="lg"
                >
                  {saving ? 'Saving...' : 'Save Location'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Select all 6 required documents, then click "Submit All Documents" button below.
              </p>
              
              <div className="space-y-4">
                {[
                  { type: 'company_registration', label: '1. COMPANY REGISTRATION' },
                  { type: 'tax_clearance', label: '2. TAX CLEARANCE' },
                  { type: 'id_document', label: '3. ID DOCUMENT' },
                  { type: 'proof_of_address', label: '4. PROOF OF ADDRESS' },
                  { type: 'bank_statement', label: '5. BANK STATEMENT' },
                  { type: 'company_profile', label: '6. COMPANY PROFILE' },
                ].map((doc) => (
                  <DocumentUploadCard
                    key={doc.type}
                    title={doc.label}
                    description="Upload PDF or image (max 10MB)"
                    documentType={doc.type}
                    status={getDocumentStatus(doc.type)}
                    selectedFile={pendingDocuments[doc.type]}
                    onFileSelect={(e) => handleFileSelect(e, doc.type)}
                  />
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Documents Button - Only show in documents tab */}
        {activeTab === 'documents' && (
          <Card className="p-6">
            <Button 
              onClick={handleSubmitDocuments}
              disabled={submittingDocs || Object.values(pendingDocuments).every(f => f === null)}
              className="w-full bg-success hover:bg-success/90"
              size="lg"
            >
              {submittingDocs ? 'Submitting Documents...' : `Submit All Documents (${Object.values(pendingDocuments).filter(f => f !== null).length}/6)`}
            </Button>
            {!allDocumentsSelected() && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please select all 6 documents before submitting
              </p>
            )}
          </Card>
        )}

        <Card className="p-6">
          <Button variant="destructive" onClick={() => signOut().then(() => navigate('/'))} className="w-full">
            Sign Out
          </Button>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

const DocumentUploadCard = ({ title, description, documentType, status, selectedFile, onFileSelect }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h5 className="font-semibold text-sm mb-1">{title}</h5>
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
          
          {selectedFile && (
            <p className="text-sm text-success mb-2">
              ✓ Selected: {selectedFile.name}
            </p>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onFileSelect}
            className="hidden"
          />
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? 'Change File' : 'Select File'}
          </Button>
        </div>
        
        {status === 'approved' && <CheckCircle className="w-6 h-6 text-success" />}
        {status === 'pending' && <Clock className="w-6 h-6 text-warning" />}
        {selectedFile && !status && <CheckCircle className="w-6 h-6 text-success" />}
        {!selectedFile && !status && <Upload className="w-6 h-6 text-muted-foreground" />}
      </div>
    </div>
  );
};

export default Profile;