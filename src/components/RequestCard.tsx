import { MapPin, Clock, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RequestCardProps {
  id: string;
  category: string;
  title: string;
  description: string;
  location: string;
  distance: number;
  urgency: 'low' | 'medium' | 'high';
  budgetMin: number;
  budgetMax: number;
  onView: () => void;
}

const urgencyColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};

export const RequestCard = ({
  category,
  title,
  description,
  location,
  distance,
  urgency,
  budgetMin,
  budgetMax,
  onView,
}: RequestCardProps) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-primary">{category}</span>
            <Badge className={urgencyColors[urgency]} variant="secondary">
              {urgency}
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{location} • {distance.toFixed(1)} km</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          <span>R{budgetMin} - R{budgetMax}</span>
        </div>
      </div>

      <Button className="w-full" variant="outline">
        View Details
      </Button>
    </Card>
  );
};
