import { useEffect, useState } from "react"
import axios from "axios"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { useParams, useNavigate } from "react-router-dom"
import { axiosByRole } from "@/utilis/apiByRole"
import { uploadImage } from "@/utilis/UploadImage"

interface Type {
  _id: string
  title: string
  image?: string
  imageUrl?: string
  fileKey?: string
}

interface FormValues {
  title: string
  image?: File | null
}

export default function TypesPage() {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
  const [role, setRole] = useState<string>("")

  const form = useForm<FormValues>({ defaultValues: { title: "", image: null } })

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]))
      setRole(decoded.role)
    }
    fetchTypes()
  }, [topicId])

  const fetchTypes = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("accessToken")
      if (!token) {
        toast({ title: "Not authenticated", variant: "destructive" })
        return
      }

      const decoded = JSON.parse(atob(token.split(".")[1]))
      const role = decoded.role
      const api = axiosByRole(role, token)

      const res = await api.get(`/courses/${courseId}/topics/${topicId}/types`)
      setTypes(res.data.types)
    } catch (err) {
      console.error(err)
      toast({ title: "Failed to fetch types", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (typeId: string, file: File) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        toast({ title: "Not authenticated", variant: "destructive" })
        return
      }

      const decoded = JSON.parse(atob(token.split(".")[1]))
      const role = decoded.role
      const api = axiosByRole(role, token)

      const { fileUrl, fileKey } = await uploadImage(file)

      await api.patch(`/courses/${courseId}/topics/${topicId}/types/${typeId}`, {
        image: fileUrl,
        fileKey,
      })

      toast({ title: "Image uploaded successfully" })
      fetchTypes()
    } catch (err: any) {
      console.error("Image upload failed:", err)
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        toast({ title: "Not authenticated", variant: "destructive" })
        return
      }

      const decoded = JSON.parse(atob(token.split(".")[1]))
      const role = decoded.role
      const api = axiosByRole(role, token)

      let finalFileKey: string | undefined

      if (data.image) {
        const { fileKey } = await uploadImage(data.image)
        finalFileKey = fileKey
      }

      const requestBody: any = {
        title: data.title,
        fileKey: finalFileKey,
      }

      await api.post(`/courses/${courseId}/topics/${topicId}/types`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      toast({ title: "Type created" })
      setOpen(false)
      setCreateImagePreview(null)
      fetchTypes()
      form.reset()
    } catch (err: any) {
      console.error("Create type failed:", err)
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create type",
        variant: "destructive",
      })
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-4">
      {/* ✅ Only show create button if NOT student */}
      {role !== "student" && (
        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Create New Type</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Type</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Type Title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ✅ Type Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr. No.</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((type, index) => (
            <TableRow key={type._id}>
              <TableCell>{index + 1}</TableCell>

              <TableCell>
                {type.imageUrl ? (
                  <img
                    src={`${type.imageUrl}`}
                    alt={type.title}
                    className={`w-12 h-12 object-cover rounded ${
                      role === "student" ? "cursor-default" : "cursor-pointer"
                    }`}
                    onClick={() => {
                      if (role !== "student") {
                        document.getElementById(`upload-${type._id}`)?.click()
                      }
                    }}
                  />
                ) : (
                  <>
                    {/* ✅ Only show "Upload" placeholder if NOT student */}
                    {role !== "student" ? (
                      <div
                        className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs cursor-pointer"
                        onClick={() =>
                          document.getElementById(`upload-${type._id}`)?.click()
                        }
                      >
                        Upload
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </>
                )}

                {/* ✅ Hidden upload input (only enabled for non-students) */}
                {role !== "student" && (
                  <input
                    type="file"
                    id={`upload-${type._id}`}
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      await handleImageUpload(type._id, file)
                    }}
                  />
                )}
              </TableCell>

              <TableCell>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() =>
                    navigate(`/courses/${courseId}/topics/${topicId}/types/${type._id}/modes`)
                  }
                >
                  {type.title}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
