import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// IMPORTANT: Configure Axios to send cookies and authorization headers (credentials)
// The `withCredentials: true` is crucial for sending HTTP-only cookies to the backend.
axios.defaults.withCredentials = true;

// --- API Function ---
const logoutUserRequest = async () => {
    // Axios will now include the cookie headers (accessToken and refreshToken)
    // due to the defaults.withCredentials setting above.
    const response = await axios.post(`${BASE_URL}/users/logout`);
    return response.data;
};

// --- React Component ---
export default function Logout() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Determine the correct login path from your router configuration
    // (You have both /auth/log-in and /auth/sign-in in your previous context, 
    // using the one from your router component: /auth/log-in)
    const LOGIN_PATH = '/auth/log-in';

    // 1. Logout Mutation Setup
    const logoutMutation = useMutation<unknown, AxiosError>({
        mutationFn: logoutUserRequest,

        // Use onSettled to guarantee client-side cleanup and redirection
        onSettled: () => {
            console.log("Logout request finished. Performing client-side cleanup and redirect.");

            // 2. Client-Side Cleanup
            queryClient.clear();
            localStorage.removeItem("user_data");

            // 3. Redirect to the login page
            navigate(LOGIN_PATH, { replace: true });
        },

        onSuccess: (data) => {
            console.log("Logout successful:", (data as { message?: string }).message || "Logged out.");
        },
        onError: (error) => {
            console.error("Logout request failed (HTTP 401/Network Error). Redirecting client anyway.", error.message);
            // The redirection still runs in onSettled, ensuring the user leaves the protected area.
        }
    });

    // 4. Trigger the logout request immediately when this component mounts
    useEffect(() => {
        // Run the mutation to initiate the logout process
        logoutMutation.mutate();
    }, []);

    // 5. Render a simple loading screen 
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-lg shadow-xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                <p className="text-lg text-gray-700">Logging you out securely...</p>
            </div>
        </div>
    );
}