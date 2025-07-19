'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useTheme} from 'next-themes';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Eye, EyeOff} from 'lucide-react';
import {toast} from 'sonner';
import api from '@/utils/axios';
import {useAuth} from '@/context/AuthenticateProvider';
import {jwtLogin, localLogin} from '@/services/auth';

export default function SignInPage() {
    const {theme} = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const {login} = useAuth();

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const tokenSigned = localStorage.getItem('token');
            if(tokenSigned) {
                const resp = await jwtLogin(email, password);
                const {token} = resp;
                login(token);
                toast.success('Sign in successful');
                router.push('/');
                return;
            }
            const resp = await localLogin(email, password);
            const {token} = resp;
            login(token);
            toast.success('Sign in successful');
            const redirectUrl = localStorage.getItem('redirectUrl') || '/';
            localStorage.removeItem('redirectUrl');
            router.push(redirectUrl);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Sign in failed';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            router.push('http://localhost:8080/auth/google');
        } catch (err: any) {
            const errorMessage = err.message || 'Google login failed';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg border-border">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-foreground">Sign in</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    className="transition-all duration-200 focus:ring-2 focus:ring-primary pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-muted-foreground"/>
                                    ) : (
                                        <Eye className="h-5 w-5 text-muted-foreground"/>
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                       xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                            strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>
                    <div className="mt-6">
                        <Button
                            variant="outline"
                            onClick={handleGoogleLogin}
                            className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                        >
                            Sign in with Google
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        New member?{' '}
                        <a href="/signup" className="text-primary hover:underline">
                            Sign up now
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}