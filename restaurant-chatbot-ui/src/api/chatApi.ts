import axios from 'axios';

//  generate a persistent device ID for tracking the user's session
const getOrCreateDeviceId = (): string => {
    let deviceId = localStorage.getItem('chatbot_device_id');
    if (!deviceId) {
        deviceId = `dev-${crypto.randomUUID()}`;
        localStorage.setItem('chatbot_device_id', deviceId);
    }
    return deviceId;
};

const deviceId = getOrCreateDeviceId();

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://altschool-restaurant-chatbot-7n38.onrender.com';

// Connecting Axios instance with the  live backend base URL
export const chatApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
    },
});
    
// Define the message payload interface
export interface ChatResponse {
    response: string;
}

// API method to transmit the chat selection input
export const sendMessage = async (message: string): Promise<ChatResponse> => {
    const { data } = await chatApi.post<ChatResponse>('/chat/message', {
        deviceId,
        message
    });
    return data;
};