'use client';

import {useState, useEffect, useRef} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {MessageCircle, Send} from 'lucide-react';
import {toast} from 'sonner';
import {motion, AnimatePresence} from 'framer-motion';
import {useAuth} from '@/context/AuthenticateProvider';
import {
    getChatId,
    sendMessage,
    getChat,
    subscribeToMessages,
    subscribeToTyping,
    MarkMessagesAsRead
} from '@/services/chat';
import {getFriendLists} from "@/services/friends";
import {Skeleton} from "@/components/ui/skeleton";
import {Separator} from "@/components/ui/separator";

// Hàm tạo URL avatar từ DiceBear
const getAvatarUrl = (seed: string) => {
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
};

interface Message {
    id: string;
    sender: string;
    recipient: string;
    content: string;
    timestamp: string;
    status?: 'sent' | 'received' | 'read';
}

interface Friend {
    email: string;
    username: string;
}

interface ChatWindowProps {
    email: string;
}

const ChatWindow = ({email}: ChatWindowProps) => {
    const {currentUser, isAuthenticated} = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const [isTyping, setIsTyping] = useState<boolean>(false);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const resp = await getFriendLists();
            console.log('Fetched friends:', resp.data);
            setFriends(resp.data || []);
        } catch (err: any) {
            toast.error(err.message || 'Không thể tải danh sách bạn bè');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedFriend || !isAuthenticated) return;
        const unsubscribeTyping = subscribeToTyping(
            selectedFriend.email,
            email,
            (typing: boolean) => setIsTyping(typing)
        );
        return () => unsubscribeTyping();
    }, [selectedFriend?.email, email, isAuthenticated]);

    useEffect(() => {
        if (selectedFriend && messages.length > 0) {
            MarkMessagesAsRead(selectedFriend.email);

        }
    }, [selectedFriend, messages, email]);

    // Real time update tin nhan
    useEffect(() => {
        if (!selectedFriend || !isAuthenticated) return;

        const unsubscribe = subscribeToMessages(
            selectedFriend.email,
            email,
            (newMessages) => {
                setMessages((prevMessages) => [...prevMessages, ...newMessages]);
                if (scrollAreaRef.current) {
                    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
                }
            }
        );

        return () => unsubscribe();
    }, [selectedFriend?.email, email, isAuthenticated]);


    useEffect(() => {
        if (email && isAuthenticated) fetchFriends();
    }, [email, isAuthenticated]);

    const handleSendMessage = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để gửi tin nhắn');
            window.location.href = '/signin';
            return;
        }
        if (!newMessage.trim()) {
            toast.error('Tin nhắn không được để trống');
            return;
        }
        if (!selectedFriend) {
            toast.error('Vui lòng chọn một người bạn để chat');
            return;
        }
        const tempMessageId = `temp_${Date.now()}`;
        try {
            // Optimistic update
            const newMessageObj: Message = {
                id: tempMessageId,
                sender: email,
                recipient: selectedFriend.email,
                content: newMessage,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, newMessageObj]);
            setNewMessage('');

            await sendMessage(selectedFriend.email, newMessage);
            toast.success('Tin nhắn đã được gửi');
        } catch (err: any) {
            toast.error(err.message || 'Không thể gửi tin nhắn');
            setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
        }
    };

    // Chọn bạn bè để chat
    const handleSelectFriend = async (friend: Friend) => {
        setSelectedFriend(friend);
        console.log(`Selected friend: ${friend}`);
        setMessages([]);
        try {
            const data = await getChat(friend.email);
            setMessages(data);
        } catch (err: any) {
            toast.error(err.message || 'Không thể tải tin nhắn');
        }
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3}}
            className="flex flex-col lg:flex-row gap-4 bg-transparent max-w-5xl mx-auto"
        >
            <Card className="w-full lg:w-1/3 bg-background border border-accent-foreground/20 rounded-lg shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground/80">Friends</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-200px)]">
                        {loading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2">
                                        <Skeleton className="w-10 h-10 rounded-full"/>
                                        <Skeleton className="h-4 w-3/4"/>
                                    </div>
                                ))}
                            </div>
                        ) : friends.length > 0 ? (
                            friends.map((friend) => (
                                <motion.div
                                    key={friend.email}
                                    whileHover={{backgroundColor: '#f1f5f9'}}
                                    className={`flex items-center gap-2 p-2 cursor-pointer rounded-md ${
                                        selectedFriend?.email === friend.email ? 'bg-blue-100' : ''
                                    }`}
                                    onClick={() => handleSelectFriend(friend)}
                                >
                                    <Avatar>
                                        <AvatarImage src={getAvatarUrl(friend.username || friend.email)}/>
                                        <AvatarFallback>{friend.username?.[0] || friend.email[0]}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium text-foreground/90">{friend.username || friend.email}</p>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">You have no friends lah :(</p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Cửa sổ chat */}
            <Card className="w-full lg:w-2/3 bg-background border border-accent-foreground/20 rounded-lg shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground/80">
                        {selectedFriend ? `Chat with ${selectedFriend.username || selectedFriend.email}` : 'Choose a friend to chat'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-300px)]" ref={scrollAreaRef}>
                        <div className="space-y-4 p-4">
                            <AnimatePresence>
                                {isTyping && (
                                    <motion.div
                                        key="typing-indicator"
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        transition={{duration: 0.2}}
                                        className="flex justify-start"
                                    >
                                        <div className="flex items-start gap-2 max-w-[70%]">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={getAvatarUrl(selectedFriend?.email || '')}/>
                                                <AvatarFallback>{selectedFriend?.username?.[0] || selectedFriend?.email?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="p-3 rounded-lg bg-gray-100 text-gray-900">
                                                <p className="text-sm italic text-gray-500">Typing...</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -10}}
                                        transition={{duration: 0.2}}
                                        className={`flex ${
                                            message.sender === email ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`flex items-start gap-2 max-w-[70%] ${
                                                message.sender === email ? 'flex-row-reverse' : ''
                                            }`}
                                        >
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={getAvatarUrl(message.sender)}/>
                                                <AvatarFallback>{message.sender[0]}</AvatarFallback>
                                            </Avatar>
                                            <div
                                                className={`p-3 rounded-lg ${
                                                    message.sender === email
                                                        ? 'bg-blue-100 dark:bg-muted text-foreground'
                                                        : 'bg-gray-100 dark:bg-muted/40 text-foreground/90'
                                                }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-foreground/40">
                                                        {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                                                            timeZone: 'Asia/Ho_Chi_Minh',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                    {message.sender === email && message.status && (
                                                        <span className="text-xs text-accent/40">
                                                                {message.status === 'sent' && '✓'}
                                                            {message.status === 'received' && '✓✓'}
                                                            {message.status === 'read' && (
                                                                <span className="text-blue-500">✓✓</span>
                                                            )}
                                                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                    {selectedFriend && (
                        <div className="flex gap-2 p-4 border-t border-accent">
                            <Input
                                placeholder="Say something..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="rounded-md text-foreground/90 border-accent"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendMessage();
                                }}
                            />
                            <Button
                                onClick={handleSendMessage}
                                className="bg-blue-600 text-foreground/90 hover:bg-blue-700"
                            >
                                <Send className="w-4 h-4"/>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ChatWindow;