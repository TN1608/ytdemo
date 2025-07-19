import api from "@/utils/axios";

export const localLogin = async (email: string, password: string) => {
    try {
        const response = await api.post('/signin', {email, password});
        // const { token } = response.data;
        // localStorage.setItem('token', token);
        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw new Error('Login failed');
    }
}

export const jwtLogin = async (email: string, password: string) => {
    try {
        const token = localStorage.getItem('token');
        const response = await api.post('/jwtLogin', {
            email,
            password
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error during JWT login:', error);
        throw new Error('JWT login failed');
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
        const response = await api.post('/signup', {email, password});
        const {token} = response.data
        localStorage.setItem('token', token);
        return response.data;
    } catch (error) {
        console.error('Error during signup:', error);
        throw new Error('Signup failed');
    }
}

export const getUserInfo = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await api.get('/getUser', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw new Error('Failed to fetch user info');
    }
}

export const sendOtp = async (email: string) => {
    try {
        const response = await api.post('/sendOtp', {email});
        return response.data;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
}

export const verifyOtp = async (email: string, otp: string) => {
    try {
        const response = await api.post('/verifyOtp', {email, otp});
        return response.data;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new Error('Failed to verify OTP');
    }
}

export const updatePassword = async (password: string) => {
    const token = localStorage.getItem('token');
    try {
        const resp = await api.post('/createPassword', {password: password}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        return resp.data;
    } catch (error) {
        console.error('Error updating password:', error);
        throw new Error('Failed to update password');
    }
}