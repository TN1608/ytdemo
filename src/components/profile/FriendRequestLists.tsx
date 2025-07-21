'use client';

import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Skeleton} from '@/components/ui/skeleton';
import {Check, X, UserPlus, UserMinus} from 'lucide-react';
import {useState} from "react";

// Hàm tạo URL avatar ảo từ DiceBear
const getAvatarUrl = (seed: string) => {
        return `
https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
    }
;

interface FriendRequestListsProps {
    requests: any[];
    sentRequests: any[];
    friend: any | null;
    loading: boolean;
    onSearch: (email: string) => void;
    onSendRequest: (email: string) => void;
    onAcceptRequest: (requestId: string) => void;
    onRejectRequest: (requestId: string) => void;
}

const FriendRequestLists = ({
                                requests,
                                sentRequests,
                                friend,
                                loading,
                                onSearch,
                                onSendRequest,
                                onAcceptRequest,
                                onRejectRequest,
                            }: FriendRequestListsProps) => {
    const [email, setEmail] = useState<string>('');

    return (
        <div className="container mx-auto p-4 space-y-4 max-w-3xl">
            <h2 className="text-xl font-semibold text-foreground">Friend Requests</h2>
            <Separator/>

            {/* Thanh tìm kiếm */}
            <div className="flex gap-2">
                <Input
                    placeholder="Search for friends by email or username..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <Button
                    onClick={() => onSearch(email)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                >
                    Search
                </Button>
            </div>

            {/* Kết quả tìm kiếm */}
            {friend && (
                <Card className="mt-4 shadow-sm">
                    <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2">Search Results</h3>
                        <div className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={getAvatarUrl(friend.username || friend.email)}
                                    alt={`${friend.username || friend.email}'s avatar`}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="text-md font-semibold text-foreground">
                                        {friend.username || friend.email}
                                    </p>
                                    <p className="text-xs text-secondary-foreground">{friend.email}</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => onSendRequest(friend.email)}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <UserPlus className="w-4 h-4 mr-1"/>
                                Add Friend
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabs cho yêu cầu đã nhận và đã gửi */}
            <Tabs defaultValue="incoming" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
                    <TabsTrigger value="sent">Sent Requests</TabsTrigger>
                </TabsList>

                {/* Yêu cầu đã nhận */}
                <TabsContent value="incoming">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, index) => (
                                <Skeleton key={index} className="h-16 w-full rounded-lg"/>
                            ))}
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="space-y-3">
                            {requests.map((request) => (
                                <Card
                                    key={request.id}
                                    className="flex flex-row items-center justify-between p-3 bg-accent border border-accent-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-row items-center space-x-4 flex-1">
                                        <img
                                            src={getAvatarUrl(request.fromUser)}
                                            alt={`${request.fromUser}'s avatar`}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <p className="text-base font-semibold text-foreground">{request.fromUser}</p>
                                            <p className="text-xs text-secondary-foreground">
                                                Received on {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row space-x-2 ml-4">
                                        <Button
                                            onClick={() => onAcceptRequest(request.id)}
                                            className="bg-green-600 text-white hover:bg-green-700"
                                        >
                                            <Check className="w-4 h-4 mr-1"/>
                                            Accept
                                        </Button>
                                        <Button
                                            onClick={() => onRejectRequest(request.id)}
                                            variant="outline"
                                            className="text-secondary-foreground hover:text-secondary-foreground/80"
                                        >
                                            <X className="w-4 h-4 mr-1"/>
                                            Reject
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">No incoming friend requests.</p>
                    )}
                </TabsContent>

                {/* Yêu cầu đã gửi */}
                <TabsContent value="sent">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, index) => (
                                <Skeleton key={index} className="h-16 w-full rounded-lg"/>
                            ))}
                        </div>
                    ) : sentRequests.length > 0 ? (
                        <div className="space-y-3">
                            {sentRequests.map((request) => (
                                <Card
                                    key={request.id}
                                    className="flex flex-row items-center justify-between p-3 bg-accent border border-accent-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-row items-center space-x-4 flex-1">
                                        <img
                                            src={getAvatarUrl(request.toUser)}
                                            alt={`${request.toUser}'s avatar`}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-base font-semibold text-foreground">{request.toUser}</p>
                                            <p className="text-xs text-foreground/50">
                                                Sent on {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => onRejectRequest(request.id)}
                                        variant="outline"
                                        className="text-foreground/60 hover:text-foreground/80 ml-4"
                                    >
                                        <UserMinus className="w-4 h-4 mr-1"/>
                                        Cancel
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-foreground/50 text-center">No sent friend requests.</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FriendRequestLists;