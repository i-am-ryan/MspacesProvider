import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { BookingCard } from '@/components/BookingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockBookings = {
  upcoming: [
    {
      id: '1',
      customer: 'Mary Johnson',
      service: 'Gate Installation',
      date: 'Nov 20, 2024',
      time: '14:00',
      location: 'Sandton, Johannesburg',
      status: 'upcoming' as const,
    },
    {
      id: '2',
      customer: 'David Lee',
      service: 'Bathroom Plumbing',
      date: 'Nov 22, 2024',
      time: '09:00',
      location: 'Rosebank',
      status: 'upcoming' as const,
    },
  ],
  inProgress: [
    {
      id: '3',
      customer: 'Sarah Williams',
      service: 'Kitchen Renovation',
      date: 'Nov 15, 2024',
      time: '10:00',
      location: 'Randburg',
      status: 'in-progress' as const,
    },
  ],
  completed: [
    {
      id: '4',
      customer: 'John Smith',
      service: 'Kitchen Sink Repair',
      date: 'Nov 14, 2024',
      time: '11:00',
      location: 'Sandton',
      status: 'completed' as const,
    },
  ],
};

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="p-4">
          <h1 className="text-xl font-bold">My Bookings</h1>
          <p className="text-sm text-muted-foreground">
            {mockBookings.upcoming.length} upcoming jobs
          </p>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming ({mockBookings.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1">
            Active ({mockBookings.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Done ({mockBookings.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="p-4 space-y-3">
          {mockBookings.upcoming.map((booking) => (
            <BookingCard key={booking.id} {...booking} />
          ))}
        </TabsContent>

        <TabsContent value="in-progress" className="p-4 space-y-3">
          {mockBookings.inProgress.map((booking) => (
            <BookingCard key={booking.id} {...booking} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="p-4 space-y-3">
          {mockBookings.completed.map((booking) => (
            <BookingCard key={booking.id} {...booking} />
          ))}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
};

export default Bookings;
