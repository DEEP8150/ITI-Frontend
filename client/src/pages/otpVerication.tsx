import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios";
import { Link ,useNavigate ,useLocation } from "react-router-dom";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useQuery = () => {
    const location = useLocation(); 
    return new URLSearchParams(location.search);
};

type OTPData = {
    email: string;
    otp: string;
};

type OTPResponse = {
    message: string;
};


const verifyOTPRequest = async (credentials: OTPData): Promise<OTPResponse> => {
    const response = await axios.post(`${BASE_URL}/users/verifyOTP`, credentials);
    return response.data;
};


export default function OtpVerification() {
    const query = useQuery();
    const initialEmail = query.get("email") || "";

    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState(initialEmail); // Pre-fill from query param if available
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (email !== initialEmail) {
            setErrorMsg(null);
        }
    }, [email, initialEmail]);


    const otpMutation = useMutation<OTPResponse, AxiosError<{ message: string }>, OTPData>({
        mutationFn: verifyOTPRequest,

        onSuccess: (data) => {
            setErrorMsg(null);
            setSuccessMsg(data.message || "Verification successful!");

            
            setTimeout(() => {
                navigate("/auth/log-in"); 
            }, 1000); 
        },

        onError: (error) => {
            setSuccessMsg(null);
            console.error("OTP verification failed:", error);
            const message = error.response?.data?.message || "Verification failed. Please try again.";
            setErrorMsg(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        // Basic validation
        if (!email || !otp || otp.length < 6) {
            setErrorMsg("Please enter a valid email and 6-digit OTP.");
            return;
        }

        otpMutation.mutate({ email, otp });
    };

    const { isPending } = otpMutation;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Card className="shadow-lg border border-gray-200">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold text-gray-900">Verify Email</CardTitle>
                        <p className="text-sm text-gray-600">Enter the 6-digit code sent to your email.</p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Success Message Display */}
                            {successMsg && (
                                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm" role="alert">
                                    {successMsg}
                                </div>
                            )}

                            {/* Error Message Display */}
                            {errorMsg && (
                                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-normal text-gray-700">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="your@email.com"
                                    disabled={isPending || !!successMsg}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="otp" className="text-sm font-normal text-gray-700">
                                    OTP Code
                                </Label>
                                <Input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.trim())}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="••••••"
                                    disabled={isPending || !!successMsg}
                                />
                            </div>

                            {/* Resend/Back to Login Links */}
                            <div className="flex justify-between items-center text-sm">
                                <Button variant="link" type="button" className="p-0 h-auto text-primary-600" disabled={isPending || !!successMsg}>
                                    Resend OTP (Future implementation)
                                </Button>
                                <Link to="/auth/log-in" className="font-normal text-gray-600 hover:text-gray-700">
                                    Back to Login
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isPending || !!successMsg}
                            >
                                {isPending ? "Verifying..." : "Verify"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}