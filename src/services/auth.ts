import api from "@/utils/axios";

export const login = async (email:string , password:string) => {
    try{
        const response = await api.post('/signin', { email, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        return response.data;
    }catch (error) {
        console.error('Error during login:', error);
        throw new Error('Login failed');
    }
}

export const googleLogin = async () => {
    try {
        window.location.href = 'http://localhost:8080/auth/google';
    } catch (error) {
        console.error('Error during Google login:', error);
        throw new Error('Google login failed');
    }
}

export const signup = async (email: string, password: string) => {
    try {
        const response = await api.post('/signup', { email, password });
        return response.data;
    } catch (error) {
        console.error('Error during signup:', error);
        throw new Error('Signup failed');
    }
}