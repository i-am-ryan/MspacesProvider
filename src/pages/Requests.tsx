import { useState } from 'react';
import { Filter } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { RequestCard } from '@/components/RequestCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const mockRequests = [
  {
    id: '1',
    category: 'Plumbing',
    title: 'Kitchen Sink Leak Repair',
    description: 'Urgent leak under kitchen sink that needs immediate attention. Water is dripping constantly.',
    location: 'Sandton',
    distance: 2.3,
    urgency: 'high' as const,
    budgetMin: 500,
    budgetMax: 1000,
  },
  {
    id: '2',
    category: 'Electrical',
    title: 'Light Fixture Installation',
    description: 'Need to install 3 ceiling light fixtures in newly renovated apartment.',
    location: 'Rosebank',
    distance: 4.7,
    urgency: 'medium' as const,
    budgetMin: 800,
    budgetMax: 1500,
  },
  {
    id: '3',
    category: 'Handyman',
    title: 'Door Handle Replacement',
    description: 'Replace broken door handle on main entrance door.',
    location: 'Randburg',
    distance: 6.2,
    urgency: 'low' as const,
    budgetMin: 300,
    budgetMax: 600,
  },
];

const Requests = () => {
  const navigate = useNavigate();
  const [requests] = useState(mockRequests);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">Available Jobs</h1>
            <p className="text-sm text-muted-foreground">{requests.length} requests nearby</p>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </header>

      {/* Requests List */}
      <div className="p-4 space-y-3">
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            {...request}
            onView={() => navigate(`/requests/${request.id}`)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Requests;
