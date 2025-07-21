'use client';

import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCallback, useEffect, useState } from 'react';
import { LikedVideo, SavedVideo } from '@/types';
import { getLikedVideos, getSavedVideos } from '@/services/video';
import { sendOtp, updatePassword, verifyOtp } from '@/services/auth';
import { useAuth } from '@/context/AuthenticateProvider';
import { toast } from 'sonner';
import LikedVideos from '@/components/profile/LikedVideos';
import SavedVideos from '@/components/profile/SavedVideos';
import SecuritySettings from '@/components/profile/SecuritySettings';
import FriendLists from '@/components/profile/FriendLists';
import FriendRequestLists from '@/components/profile/FriendRequestLists';
import {
  acceptFriendRequest,
  findFriend,
  getFriendLists,
  getFriendRequests,
  getSentFriendRequests,
  rejectFriendRequest,
  sendFriendRequest,
} from '@/services/friends';

const ProfilePage = () => {
  const router = useRouter();
  const { currentUser, fetchCurrentUser } = useAuth();
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
  const [friendLists, setFriendLists] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [friend, setFriend] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);

  const fetchData = async () => {
    if (!currentUser || !localStorage.getItem('token')) {
      router.push('/signin');
      return;
    }
    setLoading(true);
    try {
      const [friendListsResp, requestsResp, sentRequestsResp, likedVideosResp, savedVideosResp] =
        await Promise.all([
          getFriendLists().catch(() => ({ data: [] })),
          getFriendRequests().catch(() => ({ data: [] })),
          getSentFriendRequests().catch(() => ({ data: [] })),
          getLikedVideos().catch(() => ({ videos: [] })),
          getSavedVideos().catch(() => ({ videos: [] })),
        ]);
      setFriendLists(friendListsResp.data || []);
      setRequests(requestsResp.data || []);
      setSentRequests(sentRequestsResp.data || []);
      setLikedVideos(likedVideosResp.videos || []);
      setSavedVideos(savedVideosResp.videos || []);
      // console.log('Friend Lists:', friendListsResp.data);
      //   console.log('Requests:', requestsResp.data);
      //   console.log('Sent Requests:', sentRequestsResp.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      const resp: any = await sendOtp(currentUser?.email);
      if (resp?.success) {
        toast.success('OTP sent successfully');
        setIsSent(true);
        setTimeout(() => setIsSent(false), 30000);
      } else {
        throw new Error(resp?.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      toast.error(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    try {
      const resp: any = await verifyOtp(currentUser?.email, otp);
      if (resp?.success) {
        toast.success('OTP verified successfully');
        await fetchCurrentUser();
        setOtp('');
      } else {
        throw new Error(resp?.message || 'Failed to verify OTP');
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      toast.error(err.message || 'Failed to verify OTP');
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to update your password');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await updatePassword(password);
      toast.success('Password updated successfully');
      setPassword('');
      setConfirmPassword('');
      await fetchCurrentUser();
    } catch (err: any) {
      console.error('Error updating password:', err);
      toast.error(err.message || 'Failed to update password');
    }
  };

  const handleSearchFriend = useCallback(async (email: string) => {
    if (!email) {
      toast.error('Please enter an email to search');
      return;
    }
    try {
      const resp = await findFriend(email);
      setFriend(resp.data);
    } catch (err: any) {
      console.error('Error searching for friend:', err);
      toast.error(err.message || 'Failed to search for friend');
    }
  }, []);

  const handleAddFriend = useCallback(async (email: string) => {
    if (!email) {
      toast.error('Please enter an email to add');
      return;
    }
    try {
      await sendFriendRequest(email);
      toast.success('Friend request sent successfully');
      setFriend(null); // Clear search result
      await fetchData(); // Refresh requests and friend lists
    } catch (err: any) {
      console.error('Error adding friend:', err);
      toast.error(err.message || 'Failed to add friend');
    }
  }, []);

  const handleAcceptRequest = useCallback(async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      toast.success('Friend request accepted successfully');
      await fetchData(); // Refresh requests and friend lists
    } catch (err: any) {
      console.error('Error accepting friend request:', err);
      toast.error(err.message || 'Failed to accept friend request');
    }
  }, []);

  const handleRejectRequest = useCallback(async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      toast.success('Friend request rejected successfully');
      await fetchData(); // Refresh requests and friend lists
    } catch (err: any) {
      console.error('Error rejecting friend request:', err);
      toast.error(err.message || 'Failed to reject friend request');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentUser, router]);

  return (
    <div>
      <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
        <section className="flex-1">
          <Tabs defaultValue="tab-1" orientation="vertical" className="w-full flex-row">
            <TabsList className="flex-col h-fit">
              <TabsTrigger value="tab-1" className="w-full">
                Liked Videos
              </TabsTrigger>
              <TabsTrigger value="tab-2" className="w-full">
                Saved Videos
              </TabsTrigger>
              <TabsTrigger value="tab-3" className="w-full">
                Security
              </TabsTrigger>
              <TabsTrigger value="tab-4" className="w-full">
                Friend Lists
              </TabsTrigger>
              <TabsTrigger value="tab-5" className="w-full">
                Friend Requests
              </TabsTrigger>
            </TabsList>
            <div className="grow rounded-md border text-start">
              <TabsContent value="tab-1">
                <LikedVideos likedVideos={likedVideos} />
              </TabsContent>
              <TabsContent value="tab-2">
                <SavedVideos savedVideos={savedVideos} />
              </TabsContent>
              <TabsContent value="tab-3">
                <SecuritySettings
                  currentUser={currentUser}
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  otp={otp}
                  setOtp={setOtp}
                  isSent={isSent}
                  setIsSent={setIsSent}
                  handleSendOtp={handleSendOtp}
                  handleVerifyOtp={handleVerifyOtp}
                  handleUpdatePassword={handleUpdatePassword}
                />
              </TabsContent>
              <TabsContent value="tab-4">
                <FriendLists friendLists={friendLists} loading={loading} />
              </TabsContent>
              <TabsContent value="tab-5">
                <FriendRequestLists
                  requests={requests}
                  sentRequests={sentRequests}
                  friend={friend}
                  loading={loading}
                  onSearch={handleSearchFriend}
                  onSendRequest={handleAddFriend}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                />
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;