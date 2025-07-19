'use client'
import {useRouter} from "next/navigation";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {useEffect, useState} from "react";
import {LikedVideo, SavedVideo} from "@/types";
import {getLikedVideos, getSavedVideos} from "@/services/video";
import {sendOtp, updatePassword, verifyOtp} from "@/services/auth";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {useAuth} from "@/context/AuthenticateProvider";
import {Button} from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import {toast} from "sonner";

const ProfilePage = () => {
    const router = useRouter();
    const {currentUser, fetchCurrentUser} = useAuth();
    const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
    const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [isSent, setIsSent] = useState<boolean>(false);

    const fetchSavedVideos = async () => {
        try {
            const response = await getSavedVideos()
            setSavedVideos(response.videos);
        } catch (err: any) {
            console.error('Error fetching saved videos:', err);
        }
    }

    const fetchLikedVideos = async () => {
        try {
            const response = await getLikedVideos();
            setLikedVideos(response.videos);
        } catch (err: any) {
            console.error('Error fetching liked videos:', err);
        }
    }

    const handleSendOtp = async () => {
        try {
            const resp: any = await sendOtp(currentUser?.email);
            if (resp?.success) {
                toast.success('OTP sent successfully');
                setIsSent(true);
                setTimeout(() => setIsSent(false), 30000); // Reset after 30 seconds
            } else {
                throw new Error(resp?.message || 'Failed to send OTP');
            }
        } catch (err: any) {
            console.error('Error sending OTP:', err);
            toast.error(err.message || 'Failed to send OTP');
        }
    }

    const handleVerifyOtp = async (otp: string) => {
        try {
            const resp: any = await verifyOtp(currentUser?.email, otp);
            if (resp?.success) {
                toast.success('OTP verified successfully');
                await fetchCurrentUser();
                setOtp(''); // Clear OTP input
            } else {
                throw new Error(resp?.message || 'Failed to verify OTP');
            }
        } catch (err: any) {
            console.error('Error verifying OTP:', err);
            toast.error(err.message || 'Failed to verify OTP');
        }
    }

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
            await updatePassword(password)
            toast.success('Password updated successfully');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error('Error updating password:', err);
            toast.error(err.message || 'Failed to update password');
        }
    }

    useEffect(() => {
        if (!currentUser) {
            router.push('/signin'); // Redirect if not logged in
        } else {
            fetchSavedVideos();
            fetchLikedVideos();
        }
    }, [currentUser]);

    return (
        <div>
            <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
                <section className="flex-1">
                    <Tabs
                        defaultValue="tab-1"
                        orientation="vertical"
                        className="w-full flex-row"
                    >
                        <TabsList className="flex-col h-fit">
                            <TabsTrigger value="tab-1" className="w-full">
                                Liked Videos
                            </TabsTrigger>
                            <TabsTrigger value="tab-2" className="w-full">
                                Saved Videos
                            </TabsTrigger>
                            <TabsTrigger value={"tab-3"} className="w-full">
                                Security
                            </TabsTrigger>
                        </TabsList>
                        <div className="grow rounded-md border text-start">
                            <TabsContent value="tab-1">
                                <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {likedVideos.length > 0 ? (
                                        likedVideos.map(video => (
                                            <Card key={video.id} className="flex flex-col h-full">
                                                <CardHeader className="pb-2">
                                                    <h3 className="text-lg font-semibold truncate">{video.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                                                </CardHeader>
                                                <CardContent className="flex flex-col gap-2 flex-1 justify-center">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full h-48 object-cover rounded-md border"
                                                    />
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No liked videos found.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-2">
                                <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {savedVideos.length > 0 ? (
                                        savedVideos.map(video => (
                                            <Card key={video.videoId} className="flex flex-col h-full">
                                                <CardHeader className="pb-2">
                                                    <h3 className="text-lg font-semibold truncate">{video.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                                                </CardHeader>
                                                <CardContent className="flex flex-col gap-2 flex-1 justify-center">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full h-48 object-cover rounded-md border"
                                                    />
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No saved videos found.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value={"tab-3"}>
                                <div className={"p-4 space-y-4"}>
                                    <h2 className={"text-lg font-semibold mb-4"}>Security Settings</h2>
                                    <Separator/>
                                    <div className={"flex flex-col gap-4 w-2xl"}>
                                        {currentUser?.provider === 'google' && currentUser?.password === null && (
                                            <div
                                                className="mb-4 gap-4 flex flex-col bg-muted/40 rounded-lg p-6 shadow-sm border">
                                                <h3 className="text-md font-semibold flex items-center gap-2">
                                                    <span>🔒</span> Change Password
                                                </h3>
                                                <div className="flex flex-col gap-3">
                                                    <Input
                                                        type="password"
                                                        placeholder="Enter your password"
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary"
                                                    />
                                                    <Input
                                                        type="password"
                                                        placeholder="Confirm your password"
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary"
                                                    />
                                                    <Button
                                                        className="bg-foreground text-accent px-4 py-2 rounded-md font-semibold hover:bg-foreground/90 transition"
                                                        type="button"
                                                        disabled={!password || !confirmPassword}
                                                        onClick={handleUpdatePassword}
                                                    >
                                                        Update Password
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        {currentUser?.verified ? (
                                            <div
                                                className={"mb-4 gap-4 flex flex-col bg-muted/40 rounded-lg p-6 shadow-sm border"}>
                                                <h3 className="text-md font-semibold flex items-center gap-2">
                                                    <span>✅</span> Email Verified
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Your email is verified. You can change your email if needed.
                                                </p>
                                            </div>
                                        ) : (
                                            <div
                                                className="mb-4 gap-4 flex flex-col bg-muted/40 rounded-lg p-6 shadow-sm border">
                                                <h3 className="text-md font-semibold flex items-center gap-2">
                                                    <span>📧</span> Your email:
                                                </h3>
                                                <Input
                                                    type="email"
                                                    disabled
                                                    value={currentUser?.email}
                                                    className="rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary"
                                                />
                                                <div className="flex gap-3 items-center">
                                                    {!isSent ? (
                                                        <Button
                                                            className="bg-foreground text-accent px-4 py-2 rounded-md font-semibold hover:bg-foreground/90 transition"
                                                            type="button"
                                                            onClick={handleSendOtp}
                                                        >
                                                            Send OTP
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <InputOTP
                                                                maxLength={6}
                                                                value={otp}
                                                                onChange={setOtp}
                                                            >
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={0}/>
                                                                    <InputOTPSlot index={1}/>
                                                                    <InputOTPSlot index={2}/>
                                                                </InputOTPGroup>
                                                                <InputOTPSeparator/>
                                                                <InputOTPGroup>
                                                                    <InputOTPSlot index={3}/>
                                                                    <InputOTPSlot index={4}/>
                                                                    <InputOTPSlot index={5}/>
                                                                </InputOTPGroup>
                                                            </InputOTP>
                                                            <Button
                                                                className="bg-muted text-foreground px-4 py-2 rounded-md font-semibold"
                                                                type="button"
                                                                disabled
                                                            >
                                                                Resend OTP (30s)
                                                            </Button>
                                                            <Button
                                                                className="bg-foreground text-accent px-4 py-2 rounded-md font-semibold hover:bg-foreground/90 transition"
                                                                type="button"
                                                                onClick={() => handleVerifyOtp(otp)}
                                                            >
                                                                Verify OTP
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </section>
            </main>
        </div>
    )
}

export default ProfilePage;
