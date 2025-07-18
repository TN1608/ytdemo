import api from "@/utils/axios";

export const chat = async (query: any) => {
    try {
        const redirectTo = window.location.href;
        const response = await api.post('/chat' , {query},
            {
                params: {
                    redirectTo: redirectTo,
                },
            },
        );
        return response.data;
    } catch (error) {
        console.error("Error getting chat:", error);
        return Promise.reject(error);
    }
}