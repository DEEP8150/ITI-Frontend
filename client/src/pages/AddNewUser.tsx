import { useForm } from "react-hook-form"
import axios from "axios"
import { useState } from "react"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type FormValues = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
  organization: string
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL

type CreateUserPageProps = {
  defaultRole: "student" | "instructor"
  onSuccess?: () => void // optional callback after successful creation
}

export default function CreateUserPage({ defaultRole, onSuccess }: CreateUserPageProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const adminOrgId = localStorage.getItem("organizationId")

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: defaultRole, // set role from prop
      organization: adminOrgId || undefined,
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")

      const payload = {
        ...data,
        organization: adminOrgId,
      }

      const res = await axios.post(`${BASE_URL}/admin/newUsers`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast({
        title: `✅ User Created Successfully and Email Sent`,
        description: `${res.data.user.firstName} ${res.data.user.lastName} (${res.data.user.role})`,
      })

      form.reset({ ...form.getValues(), role: defaultRole }) // keep role default
      onSuccess?.() // refresh parent list if needed
    } catch (err: any) {
      console.error("Error creating user:", err)
      toast({
        title: `❌ Error`,
        description: err.response?.data?.message || "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Last Name */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  )
}

