import api from "@/utils/axios";

export const getFriendLists = async () => {
    try {
        const response = await api.get('/friends')
        return response.data;
    } catch (err: any) {
        console.error('Error fetching friend lists:', err);
        throw new Error(err.message || 'Failed to fetch friend lists');
    }
}

export const getFriendRequests = async () => {

    try {
        const response = await api.get('/requests')
        return response.data;
    } catch (err: any) {
        console.error('Error fetching friend requests:', err);
        throw new Error(err.message || 'Failed to fetch friend requests');
    }
}

export const sendFriendRequest = async (email: string) => {
    try {
        const response = await api.post('/request', {email})
        return response.data;
    } catch (err: any) {
        console.error('Error sending friend request:', err);
        throw new Error(err.message || 'Failed to send friend request');
    }
}

export const acceptFriendRequest = async (requestId: string) => {

    try {
        const response = await api.post(`/accept/${requestId}`)
        return response.data;
    } catch (err: any) {
        console.error('Error accepting friend request:', err);
        throw new Error(err.message || 'Failed to accept friend request');
    }
}

export const rejectFriendRequest = async (requestId: string) => {

    try {
        const response = await api.post(`/reject/${requestId}`)
        return response.data;
    } catch (err: any) {
        console.error('Error rejecting friend request:', err);
        throw new Error(err.message || 'Failed to reject friend request');
    }
}

export const findFriend = async (email: string) => {

    try {
        const response = await api.post(`/friend/${email}`)
        return response.data;
    } catch (err: any) {
        console.error('Error finding friend:', err);
        throw new Error(err.message || 'Failed to find friend');
    }
}

export const getSentFriendRequests = async () => {

    try {
        const response = await api.get('/requestsSent')
        return response.data;
    } catch (err: any) {
        console.error('Error fetching sent requests:', err);
        throw new Error(err.message || 'Failed to fetch sent requests');
    }
}