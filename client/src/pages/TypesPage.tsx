// src/pages/TypesPage.tsx
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

interface Type {
  _id: string
  title: string
  image?: string
}

interface FormValues {
  title: string
  image?: File | null
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function TypesPage() {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)

  const form = useForm<FormValues>({ defaultValues: { title: "", image: null } })

  useEffect(() => {
    fetchTypes()
  }, [topicId])

  const fetchTypes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")
      const res = await axios.get(`${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
      const formData = new FormData()
      formData.append("image", file)

      const token = localStorage.getItem("accessToken")
      await axios.patch(`${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types/${typeId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      })
      toast({ title: "Image uploaded" })
      fetchTypes()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to upload image", variant: "destructive" })
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      if (data.image) formData.append("image", data.image)

      const token = localStorage.getItem("accessToken")
      await axios.post(`${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      })
      toast({ title: "Type created" })
      setOpen(false)
      setCreateImagePreview(null)
      form.reset()
      fetchTypes()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to create type", variant: "destructive" })
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Create New Type</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Create New Type</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Type Title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="image" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-end gap-2">
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

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
                {type.image ? (
                  <img src={`${BASE_URL}${type.image}`} alt={type.title} className="w-12 h-12 object-cover rounded cursor-pointer"
                    onClick={() => document.getElementById(`upload-${type._id}`)?.click()} />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs cursor-pointer"
                    onClick={() => document.getElementById(`upload-${type._id}`)?.click()}>Upload</div>
                )}
                <input type="file" id={`upload-${type._id}`} className="hidden" accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return
                    await handleImageUpload(type._id, file)
                  }}
                />
              </TableCell>
              <TableCell>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => navigate(`/courses/${courseId}/topics/${topicId}/types/${type._id}/modes`)}
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
