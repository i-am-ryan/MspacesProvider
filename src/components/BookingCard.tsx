import { Calendar, Clock, MapPin, MessageSquare, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BookingCardProps {
  id: string;
  customer: string;
  avatar?: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  onMessage?: () => void;
  onCall?: () => void;
}

const statusColors = {
  upcoming: 'bg-primary/10 text-primary',
  'in-progress': 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const statusLabels = {
  upcoming: 'Upcoming',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const BookingCard = ({
  customer,
  avatar,
  service,
  date,
  time,
  location,
  status,
  onMessage,
  onCall,
}: BookingCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatar} />
          <AvatarFallback>{customer.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold">{customer}</h3>
            <Badge className={statusColors[status]} variant="secondary">
              {statusLabels[status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{service}</p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onMessage}>
          <MessageSquare className="w-4 h-4 mr-1" />
          Message
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onCall}>
          <Phone className="w-4 h-4 mr-1" />
          Call
        </Button>
      </div>
    </Card>
  );
};
