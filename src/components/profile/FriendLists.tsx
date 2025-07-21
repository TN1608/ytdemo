'use client';

import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {User, MessageCircle} from 'lucide-react';

// Hàm tạo URL avatar ảo từ DiceBear
const getAvatarUrl = (seed: string) => {
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
};

// Hàm tạo màu ngẫu nhiên cho trạng thái online/offline
const getRandomStatusColor = () => {
    const colors = ['bg-green-500', 'bg-gray-500'];
    return colors[Math.floor(Math.random() * colors.length)];
};

interface FriendListsProps {
    friendLists: any[];
    loading: boolean;
}

const FriendLists = ({friendLists, loading}: FriendListsProps) => {


    return (
        <div className="p-4 space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Friend Lists</h2>
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} className="h-20 w-full rounded-lg"/>
                    ))}
                </div>
            ) : friendLists?.length > 0 ? (
                <div className="space-y-3">
                    {friendLists.map((friend) => (
                        <Card
                            key={friend?.email}
                            className="flex flex-row items-center p-4 bg-accent border border-accent-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <img
                                src={getAvatarUrl(friend?.username || friend?.email)}
                                alt={`${friend?.username || friend?.email}'s avatar`}
                                className="w-16 h-16 rounded-full mr-6 object-cover"
                            />
                            <CardContent className="flex-1 p-0 flex flex-row items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-base font-semibold text-foreground line-clamp-1">
                                        {friend?.username || friend?.email}
                                    </h3>
                                    <div className={`w-2.5 h-2.5 rounded-full ${getRandomStatusColor()}`}/>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-foreground/60 hover:text-foreground/90"
                                        onClick={() => alert(`View profile of ${friend?.username || friend?.email}`)}
                                    >
                                        <User className="w-4 h-4 mr-1"/>
                                        Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-foreground/60 hover:text-foreground/90"
                                        onClick={() => alert(`Message ${friend?.username || friend?.email}`)}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-1"/>
                                        Message
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-foreground/50 text-center">No friends found.</p>
            )}
        </div>
    );
};

export default FriendLists;