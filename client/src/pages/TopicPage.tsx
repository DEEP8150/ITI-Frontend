// src/pages/TopicPage.tsx
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
import { uploadImage } from "@/utilis/UploadImage"

interface Topic {
  _id: string
  title: string
  description?: string
  image?: string
}

interface FormValues {
  title: string
  description: string
  image?: File | null
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function TopicPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(null)

  const form = useForm<FormValues>({ defaultValues: { title: "", description: "", image: null } })
  const updateForm = useForm<FormValues>({ defaultValues: { title: "", description: "", image: null } })

  useEffect(() => {
    fetchTopics()
  }, [courseId])

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")
      console.log("token ", token)
      const res = await axios.get(`${BASE_URL}/admin/courses/${courseId}/topics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("res on topic page", res)
      setTopics(res.data)
    } catch (err) {
      console.error(err)
      toast({ title: "Failed to fetch topics", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (topicId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append("image", file)

      const token = localStorage.getItem("accessToken")
      const res = await axios.patch(`${BASE_URL}/admin/courses/${courseId}/topics/${topicId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      })
      toast({ title: "Image uploaded" })
      fetchTopics()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to upload image", variant: "destructive" })
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)
      if (data.image) formData.append("image", data.image)

      const token = localStorage.getItem("accessToken")
      await axios.post(`${BASE_URL}/admin/courses/${courseId}/topics`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      })
      toast({ title: "Topic created" })
      setOpen(false)
      setCreateImagePreview(null)
      form.reset()
      fetchTopics()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to create topic", variant: "destructive" })
    }
  }

  const handleUpdateClick = (topic: Topic) => {
    setSelectedTopic(topic)
    updateForm.reset({ title: topic.title, description: topic.description || "", image: null })
    setUpdateImagePreview(topic.image ? `${BASE_URL}${topic.image}` : null)
    setUpdateDialogOpen(true)
  }

  const onUpdateSubmit = async (data: FormValues) => {
    if (!selectedTopic) return
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)
      if (data.image) formData.append("image", data.image)

      const token = localStorage.getItem("accessToken")
      await axios.patch(`${BASE_URL}/admin/courses/${courseId}/topics/${selectedTopic._id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      })
      toast({ title: "Topic updated" })
      setUpdateDialogOpen(false)
      setUpdateImagePreview(null)
      fetchTopics()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update topic", variant: "destructive" })
    }
  }

  const handleDeleteClick = (topic: Topic) => {
    setSelectedTopic(topic)
    setDeleteDialogOpen(true)
  }

  const onDeleteConfirm = async () => {
    if (!selectedTopic) return
    try {
      const token = localStorage.getItem("accessToken")
      await axios.delete(`${BASE_URL}/admin/courses/${courseId}/topics/${selectedTopic._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({ title: "Topic deleted" })
      setDeleteDialogOpen(false)
      fetchTopics()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete topic", variant: "destructive" })
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>Create New Topic</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Create New Topic</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} placeholder="Topic Title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input {...field} placeholder="Description" /></FormControl>
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
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((t, index) => (
            <TableRow key={t._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {t.image ? (
                  <img src={`${BASE_URL}${t.image}`} alt={t.title} className="w-12 h-12 object-cover rounded cursor-pointer"
                    onClick={() => document.getElementById(`upload-${t._id}`)?.click()} />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs cursor-pointer"
                    onClick={() => document.getElementById(`upload-${t._id}`)?.click()}>Upload</div>
                )}
                <input type="file" id={`upload-${t._id}`} className="hidden" accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return
                    await handleImageUpload(t._id, file)
                  }}
                />
              </TableCell>
              <TableCell>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => navigate(`/courses/${courseId}/topics/${t._id}/types`)}
                >
                  {t.title}
                </span>
              </TableCell>
              <TableCell>{t.description}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdateClick(t)}>Update</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(t)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ------------------ Update Dialog ------------------ */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Update Topic</DialogTitle></DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField control={updateForm.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={updateForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={updateForm.control} name="image" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2">
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ------------------ Delete Dialog ------------------ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Topic</DialogTitle></DialogHeader>
          <p>Are you sure you want to delete <strong>{selectedTopic?.title}</strong>?</p>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={onDeleteConfirm}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
