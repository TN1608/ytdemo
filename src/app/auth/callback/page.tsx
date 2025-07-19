'use client'
import {useEffect} from "react";
import {useAuth} from "@/context/AuthenticateProvider";

const AuthCallbackPage = () => {
    const {login} = useAuth()

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        if (token) {
            login(token);
            const redirectUrl = localStorage.getItem('redirectUrl') || '/';
            localStorage.removeItem('redirectUrl');
            window.location.href = redirectUrl;
        }
    }, [login]);
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-lg shadow-md p-8">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                 viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Đang xử lý đăng nhập...</h1>
            <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
        </div>
    )
}

export default AuthCallbackPage;