import axios from 'axios';
import * as localStore from './localStorage';

const API_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.response.use(
    response => response,
    error => {

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    authService.logout();
                    window.location.href = '/login';
                    console.error('Unauthorized access - logging out');
                    break;
                case 403:
                    console.error('Forbidden - you do not have permission to access this resource');
                    break;
                case 404:
                    console.error('Resource not found - check the URL');
                    break;
                case 500:
                    console.error('Internal server error - something went wrong on the server');
                    break;
                default:
                    console.error(`Unexpected error: ${error.response.status}`);
                    break;
            }
        } else if (error.request) {
            console.error('Request made but no response received', error.request);
        } else {
            console.error('Request error', error.message);
        }
        return Promise.reject(error);
    }
);

const generateUserColor = () => {
    const colors = localStore.randomColorForUser;
    return colors[Math.floor(Math.random() * colors.length)];
}

export const authService = {
    login: async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            if (response.status === 200 && response.data) {
                const userColor = generateUserColor();
                const userData = {
                    ...response.data,
                    color: userColor,
                    loginTime: new Date().toISOString(),
                };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem("currentUser", JSON.stringify(response.data));
                return {
                    success: true,
                    user: userData,
                };
            }

        } catch (error) {
            console.error('Login failed', error);
            const errorMessage = error.response?.data?.message || 'Login failed';
            throw new Error(errorMessage);
        }
    },
    signup: async (username, password, email) => {
        try {
            const response = await api.post('/auth/signup', { username, password, email });
            if (response.status === 200 && response.data) {
                return {
                    success: true,
                    user: response.data,
                };
            }

        } catch (error) {
            console.error('Signup failed', error);
            const errorMessage = error.response?.data?.message || 'Signup failed';
            throw new Error(errorMessage);
        }
    },
    logout: async (username) => {
        try {
            await api.post('/auth/logout', { username });
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem("currentUser");

            console.log('User logged out');
        }

    },
    fetchCurrentUser: async () => {
        try {
            const response = await api.get('/auth/getcurrentuser');
            if (response.data && response.data.user) {
                localStorage.setItem('user', JSON.stringify(userData));
                return response.data;
            };
        } catch (error) {
            console.error('Failed to fetch current user', error);
            if (error.response && error.response.status === 401) {
                authService.logout();
                window.location.href = '/login';
            }
            throw new Error(error.response?.data?.message || 'Failed to fetch current user');
        }
    },
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        const currentUser = localStorage.getItem('currentUser');

        try {
            if (user) {
                const userData = JSON.parse(user);
                const userColor = generateUserColor();
                return {
                    ...userData,
                    color: userColor,
                };
            } else if (currentUser) {
                return JSON.parse(currentUser);
            }
            return null;
        } catch (error) {
            console.error('Failed to parse user data', error);
            return null;
        }

    },
    isAuthenticated: () => {
        const user = localStorage.getItem('user') || localStorage.getItem('currentUser');
        return !!user;
    },
    fetchPrivateMessage: async (user1, user2) => {
        try {
            const response = await api.get(`/api/messages/private?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`);
            if (response.data) {
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch private messages', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch private messages');
        }
    },
    getOnlineUsers: async () => {
        try {
            const response = await api.get('/auth/getonlineusers');
            if (response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Failed to fetch online users', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch online users');
        }
    },
};
