import api from "@/utils/axios";
import {db} from '@/utils/firebase';
import {collection, query, orderBy, onSnapshot, getDocs} from 'firebase/firestore';

export const getChatId = (userEmail1: string, userEmail2: string): string => {
    const sortedEmails = [userEmail1, userEmail2].sort();
    return `${sortedEmails[0]}_${sortedEmails[1]}`;
};

export const sendMessage = async (recipientEmail: string, content: string) => {
    try {
        const resp = await api.post('/chat', {recipientEmail, content});
        return resp.data;
    } catch (err: any) {
        console.error('Error fetching chat:', err);
        throw new Error(err.message || 'Failed to fetch chat');
    }
}

export const getChat = async (recipientEmail: string) => {
    try {
        const resp = await api.get('/getChat', {
            params: {recipientEmail}
        })
        return resp.data;
    } catch (err: any) {
        console.error('Error fetching chat:', err);
        throw new Error(err.message || 'Failed to fetch chat');
    }
}

export const subscribeToMessages = (
    recipientEmail: string,
    userEmail: string,
    callback: (messages: {
        id: string;
        sender: string;
        recipient: string;
        content: string;
        timestamp: string
    }[]) => void
) => {
    const chatId = getChatId(userEmail, recipientEmail);
    const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    sender: data.sender ?? '',
                    recipient: data.recipient ?? '',
                    content: data.content ?? '',
                    timestamp: data.timestamp ?? ''
                };
            });
        callback(messages);
    });
    return unsubscribe;
};

export const subscribeToTyping = (friendEmail: string, userEmail: string, callback: (typing: boolean) => void) => {
    const chatId = getChatId(userEmail, friendEmail);
    const typingRef = collection(db, 'chats', chatId, 'typing');
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
        const typingData = snapshot.docs.map(doc => doc.data());
        const isTypingNow = typingData.some(data => data.email === friendEmail && data.typing);
        callback(isTypingNow);
    });
    return unsubscribe;
};

export const MarkMessagesAsRead = async (recipientEmail: string) => {
    try{
        const resp = await api.get('/markAsRead', {
            params: {recipientEmail}
        });
        console.log('Messages marked as read:', resp.data);
        return resp.data;
    }catch (err: any) {
        console.error('Error marking messages as read:', err);
        throw new Error(err.message || 'Failed to mark messages as read');
    }
}
