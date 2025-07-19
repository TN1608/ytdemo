'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {toast} from 'sonner';
import {getUserInfo} from "@/services/auth";

interface AuthContextType {
    isAuthenticated: boolean;
    fetchCurrentUser: () => Promise<void>;
    login: (token: string) => void;
    logout: () => void;
    currentUser: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const router = useRouter();

    const fetchCurrentUser = async () => {
        try {
            const resp = await getUserInfo();
            setCurrentUser(resp);
        } catch (err: any) {
            console.error('Error fetching current user:', err);
            toast.error(err.response.message || 'Lấy thông tin người dùng thất bại');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCurrentUser();
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        toast.success('Đăng xuất thành công');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout, currentUser, fetchCurrentUser}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};