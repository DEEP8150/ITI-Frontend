import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "+91 ",
      bio: "",
    },
  });

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.data;
        form.reset({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone ? `+91 ${user.phone.replace(/^(\+91\s)?/, "")}` : "+91 ",
          bio: "",
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const token = localStorage.getItem("accessToken");

      const phoneWithoutCode = data.phone.replace("+91 ", "").trim();

      await axios.patch(
        `${BASE_URL}/users/profile`,
        { ...data, phone: phoneWithoutCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: "Profile updated successfully!" });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast({ title: "Error updating profile", description: err.response?.data?.message, variant: "destructive" });
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-xl w-full max-w-lg p-6 m-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Update Profile</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="First Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Last Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+91 XXXXXXXXXX" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Write something about yourself..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-2">
              Update Profile
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
