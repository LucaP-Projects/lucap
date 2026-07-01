'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { sendMessage } from './actions';
import { toast } from 'sonner';

type Message = {
  id: string;
  author: string | null;
  message: string;
  type: string;
  date: Date;
};

interface TicketThreadProps {
  ticketId: string;
  initialMessages: Message[];
  currentUserName: string;
}

export function TicketThread({ ticketId, initialMessages, currentUserName }: TicketThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const result = await sendMessage({
        ticketId,
        message: newMessage,
        type: 'text'
      });

      setMessages([...messages, {
        id: result.id,
        author: result.author,
        message: result.message,
        type: result.type,
        date: new Date(result.date)
      }]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      toast.error('Error while sending');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border shadow-sm overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50"
      >
        {messages.map((msg) => {
          const isOwn = msg.author === currentUserName;
          const isStaff = msg.author?.toLowerCase().includes('staff') || msg.type === 'note';

          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex items-start gap-3 max-w-[80%]",
                isOwn ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <Avatar className="w-8 h-8 border">
                <AvatarFallback className={cn(isOwn ? "bg-navy text-white" : "bg-gray-100")}>
                  {msg.author?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className={cn(
                "group relative flex flex-col gap-1",
                isOwn ? "items-end" : ""
              )}>
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold text-gray-500">{msg.author}</span>
                  <span className="text-[10px] text-gray-400">
                    {format(new Date(msg.date), 'p')}
                  </span>
                </div>
                
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm",
                  isOwn 
                    ? "bg-navy text-white rounded-tr-none" 
                    : "bg-white border text-[#121c2c] rounded-tl-none"
                )}>
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex flex-col gap-3">
          <Textarea 
            placeholder="Write your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[100px] resize-none focus-visible:ring-navy"
          />
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-muted-foreground italic">
              Press Enter to send
            </p>
            <Button 
              onClick={handleSend}
              disabled={isSending || !newMessage.trim()}
              className="bg-navy hover:bg-navy-light text-white"
            >
              {isSending ? (
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fa-solid fa-paper-plane mr-2"></i>
              )}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
