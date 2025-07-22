'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthenticateProvider';
import ChatWindow from '@/components/chat/ChatWindow';

const ChatButton = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleChat = () => {
    if (!isAuthenticated) {
      window.location.href = '/signin';
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <motion.div
      initial={{ scale: 0, bottom: 20, right: 20 }}
      animate={{ scale: isOpen ? 1 : 0.8, bottom: 20, right: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed z-50"
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className="rounded-full w-14 h-14 bg-blue-600 text-white hover:bg-blue-700 shadow-lg flex items-center justify-center"
            onClick={handleToggleChat}
          >
            {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[90vw] max-w-4xl h-[70vh] p-0 bg-transparent border-none shadow-none"
          align="end"
          side="top"
        >
          <ChatWindow email={currentUser?.email || ''} />
        </PopoverContent>
      </Popover>
    </motion.div>
  );
};

export default ChatButton;