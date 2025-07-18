'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/utils/axios';
import {useAuth} from "@/context/AuthenticateProvider";

export default function SignInPage() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await api.post('/signin', { email, password });
            const { token } = resp.data;
            login(token);
            toast.success('Đăng nhập thành công');
            const redirectUrl = localStorage.getItem('redirectUrl') || '/';
            localStorage.removeItem('redirectUrl');
            router.push(redirectUrl);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            window.location.href = 'http://localhost:8080/auth/google';
        } catch (err: any) {
            toast.error(err.message || 'Đăng nhập với Google thất bại');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium">
                        Mật khẩu
                    </label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
            </form>
            <div className="mt-4 text-center">
                <Button variant="outline" onClick={handleGoogleLogin}>
                    Đăng nhập với Google
                </Button>
            </div>
        </div>
    );
}