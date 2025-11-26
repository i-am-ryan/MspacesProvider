import { useState, useEffect } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface ServiceAutocompleteProps {
  value: string;
  onChange: (value: string, serviceId?: string) => void;
}

export const ServiceAutocomplete = ({ value, onChange }: ServiceAutocompleteProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setServices(data || []);
  };

  const handleChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.length > 0) {
      const matches = services.filter(s => 
        s.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFiltered(matches);
      setShowDropdown(true);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (service: any) => {
    onChange(service.name, service.id);
    setShowDropdown(false);
    setFiltered([]);
  };

  const isNewService = value.length > 2 && filtered.length === 0;

  return (
    <div>
      <Label htmlFor="serviceType">Service Type *</Label>
      <p className="text-xs text-muted-foreground mb-2">
        Type to search existing services or add a new one
      </p>
      
      <div className="relative">
        <Input
          id="serviceType"
          placeholder="Start typing... (e.g., Plumbing, Electrical)"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => value.length > 0 && setShowDropdown(true)}
          autoComplete="off"
        />
        
        {/* Dropdown */}
        {showDropdown && filtered.length > 0 && (
          <div className="absolute z-[9999] w-full mt-1 bg-white border border-border rounded-lg shadow-2xl max-h-80 overflow-y-auto">
            {filtered.map((service) => (
              <button
                key={service.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(service);
                }}
                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0 flex items-start gap-3"
              >
                <Search className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{service.name}</div>
                  <div className="text-xs text-muted-foreground">{service.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* New service message */}
        {isNewService && (
          <div className="mt-2 px-4 py-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
              <CheckCircle className="w-4 h-4" />
              New service: "{value}"
            </div>
            <p className="text-xs text-muted-foreground">
              Will be submitted for admin approval before appearing in search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};