import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
// import { Link, useLocation } from "wouter";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios";
import OtpVerification from "@/pages/otpVerication";
import { useAuth } from "./AuthContext";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("VITE_API_BASE_URL is:", BASE_URL);

type LoginData = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
  user: {
    accessToken: string;
    refreshToken: string;
    loggedInUser: any; // Or a detailed User type
    id: string; // Assuming user IDs are strings (ObjectId in Mongoose)
    role: string;
    email: string;
    organization: any | null; // Or a detailed Organization type
  };
};


const loginUser = async (credentials: LoginData): Promise<LoginResponse> => {
  const response = await axios.post(`${BASE_URL}/users/login`, credentials);
  return response.data;
};
console.log("loginUser :", loginUser);

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const { setUser } = useAuth(); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // const [_, setLocation] = useLocation();

  const navigate = useNavigate();

  const loginMutation = useMutation<LoginResponse, AxiosError<{ message: string }>, LoginData>({
    mutationFn: loginUser,

    onSuccess: (data) => {
      setErrorMsg(null);
      console.log("Login successful!", data);

      localStorage.setItem('accessToken', data.user.accessToken);

      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role as "superAdmin" | "admin" | "instructor" | "student",
        organization: data.user.organization,
      });

      // setLocation('/dashboard');
      navigate('/dashboard');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },

    onError: (error) => {
      console.error("Login failed:", error);

      const backendMessage = error.response?.data?.message;
      const statusCode = error.response?.status;

      if (statusCode === 403 && backendMessage && backendMessage.includes("Please verify your email")) {

        //  setLocation(`/auth/otp-verification?email=${formData.email}`);

        navigate(`/auth/otp-verification?email=${formData.email}`);

        setErrorMsg(null);
        return;
      }

      const message = backendMessage || "Login failed. Check your credentials.";
      setErrorMsg(message);
    },
  });


  useEffect(() => {
    // This will only run when the loginMutation object reference changes,
    // or when the component mounts/unmounts, which is much less often.
    // It's a cleaner way to log non-state-critical information.
    // You could also specifically log when it changes state:
    // console.log("Mutation status changed:", loginMutation.status);
    // console.log("Login mutation:", loginMutation);
    // But often, logging in onError and onSuccess is sufficient.
    // For now, let's keep it simple and just rely on the onSuccess/onError logs.
  }, [loginMutation])

  // console.log("Login mutation:", loginMutation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("log in submitted:", formData);

    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  const { isPending } = loginMutation;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-900">Login</CardTitle>
            <p className="text-sm text-gray-600">Welcome back! Please login to your account</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Add display for Invalid Credentials error message */}
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
                  value={formData.email}
                  onChange={(e) => { setErrorMsg(null); setFormData({ ...formData, email: e.target.value }) }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="your@email.com"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-normal text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => { setErrorMsg(null); setFormData({ ...formData, password: e.target.value }) }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rememberMe: checked as boolean })
                    }
                  />
                  <Label htmlFor="remember-me" className="text-sm text-gray-700">
                    Remember me
                  </Label>
                </div>
                <Button variant="secondary" size="sm" type="button" disabled={isPending}>
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "logning In..." : "logIn"}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="w-full">
                  <svg className="w-5 h-5 mr-2 text-red-500" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
                <Button variant="secondary" className="w-full">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </Button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/auth/registration" className="font-normal text-primary-600 hover:text-primary-700">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}