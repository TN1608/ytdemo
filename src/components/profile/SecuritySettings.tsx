'use client';

import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import FriendLists from "@/components/profile/FriendLists";

interface SecuritySettingsProps {
    currentUser: any;
    password: string;
    setPassword: (value: string) => void;
    confirmPassword: string;
    setConfirmPassword: (value: string) => void;
    otp: string;
    setOtp: (value: string) => void;
    isSent: boolean;
    setIsSent: (value: boolean) => void;
    handleSendOtp: () => Promise<void>;
    handleVerifyOtp: (otp: string) => Promise<void>;
    handleUpdatePassword: () => Promise<void>;
}

export default function SecuritySettings({
                                             currentUser,
                                             password,
                                             setPassword,
                                             confirmPassword,
                                             setConfirmPassword,
                                             otp,
                                             setOtp,
                                             isSent,
                                             setIsSent,
                                             handleSendOtp,
                                             handleVerifyOtp,
                                             handleUpdatePassword,
                                         }: SecuritySettingsProps) {
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
            <Separator/>
            <div className="flex flex-col gap-4 w-2xl">
                {currentUser?.provider === 'google' && !currentUser?.hasPassword && (
                    <div className="mb-4 gap-4 flex flex-col bg-muted/40 rounded-lg p-6 shadow-sm border">
                        <h3 className="text-md font-semibold flex items-center gap-2">
                            <span>🔒</span> Create Password
                        </h3>
                        <div className="flex flex-col gap-3">
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                className="rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary"
                            />
                            <Input
                                type="password"
                                placeholder="Confirm your password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                className="rounded-md border px-3 py-2 focus:ring-2 focus:ring-primary"
                            />
                            <Button
                                className="bg-foreground text-accent px-4 py-2 rounded-md font-semibold hover:bg-foreground/90 transition"
                                type="button"
                                disabled={!password || !confirmPassword}
                                onClick={handleUpdatePassword}
                            >
                                Create Password
                            </Button>
                        </div>
                    </div>
                )}
                {currentUser?.provider === 'google' && currentUser?.hasPassword && (
                    <p className="text-sm text-muted-foreground">Password has already been set.</p>
                )}
                {currentUser?.verified ? (
                    <div className="mb-4 gap-4 flex flex-col bg-muted/40 rounded-lg p-6 shadow-sm border">
                        <h3 className="text-md font-semibold flex items-center gap-2">
                            <span>✅</span> Email Verified
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Your email is verified. You can change your email if needed.
                        </p>
                    </div>
                ) : (
                    <div className="mb-4 gap-4 flex flex-col bg-muted/40 rounded-lg p-6 shadow-sm border">
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
                                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
    );
}