import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const mockConversations = [
  {
    id: '1',
    customer: 'Mary Johnson',
    lastMessage: 'Thanks! See you tomorrow at 2pm',
    timestamp: '10m ago',
    unread: 2,
    booking: 'Gate Installation',
  },
  {
    id: '2',
    customer: 'John Smith',
    lastMessage: 'Great work, thanks!',
    timestamp: '1h ago',
    unread: 0,
    booking: 'Kitchen Sink Repair',
  },
  {
    id: '3',
    customer: 'Sarah Williams',
    lastMessage: 'When can you start the work?',
    timestamp: '3h ago',
    unread: 1,
    booking: 'Kitchen Renovation',
  },
];

const Messages = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="p-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {mockConversations.filter(c => c.unread > 0).length} unread
          </p>
        </div>
      </header>

      {/* Conversations List */}
      <div className="p-4 space-y-2">
        {mockConversations.map((conversation) => (
          <Card
            key={conversation.id}
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback>{conversation.customer.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">{conversation.customer}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {conversation.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1 truncate">
                  {conversation.lastMessage}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {conversation.booking}
                  </span>
                  {conversation.unread > 0 && (
                    <Badge className="bg-primary text-white">
                      {conversation.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Messages;
