// src/pages/ProcessesPage.tsx
import { useEffect, useState } from "react"
import axios from "axios"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { useParams } from "react-router-dom"

interface Process {
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

export default function ProcessesPage() {
  const { courseId, topicId, typeId, modeId } = useParams<{
    courseId: string
    topicId: string
    typeId: string
    modeId: string
  }>()
  const { toast } = useToast()

  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(null)

  const createForm = useForm<FormValues>({ defaultValues: { title: "", description: "", image: null } })
  const updateForm = useForm<FormValues>({ defaultValues: { title: "", description: "", image: null } })

  useEffect(() => {
    fetchProcesses()
  }, [modeId])

  const fetchProcesses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")
      const res = await axios.get(
        `${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setProcesses(res.data.processes)
    } catch (err) {
      console.error(err)
      toast({ title: "Failed to fetch processes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (processId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append("image", file)

      const token = localStorage.getItem("accessToken")
      await axios.patch(
        `${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes/${processId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      )
      toast({ title: "Image uploaded" })
      fetchProcesses()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to upload image", variant: "destructive" })
    }
  }

  const onCreateSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)
      if (data.image) formData.append("image", data.image)

      const token = localStorage.getItem("accessToken")
      await axios.post(
        `${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      )
      toast({ title: "Process created" })
      setOpenCreate(false)
      setCreateImagePreview(null)
      createForm.reset()
      fetchProcesses()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to create process", variant: "destructive" })
    }
  }

  const handleUpdateClick = (process: Process) => {
    setSelectedProcess(process)
    updateForm.reset({ title: process.title, description: process.description || "", image: null })
    setUpdateImagePreview(process.image ? `${BASE_URL}${process.image}` : null)
    setOpenUpdate(true)
  }

  const onUpdateSubmit = async (data: FormValues) => {
    if (!selectedProcess) return
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)
      if (data.image) formData.append("image", data.image)

      const token = localStorage.getItem("accessToken")
      await axios.patch(
        `${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes/${selectedProcess._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      )
      toast({ title: "Process updated" })
      setOpenUpdate(false)
      setUpdateImagePreview(null)
      fetchProcesses()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update process", variant: "destructive" })
    }
  }

  const handleDeleteClick = (process: Process) => {
    setSelectedProcess(process)
    setOpenDelete(true)
  }

  const onDeleteConfirm = async () => {
    if (!selectedProcess) return
    try {
      const token = localStorage.getItem("accessToken")
      await axios.delete(
        `${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes/${selectedProcess._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({ title: "Process deleted" })
      setOpenDelete(false)
      fetchProcesses()
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete process", variant: "destructive" })
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-4">
      {/* ----------------- Create Process Dialog ----------------- */}
      <div className="flex justify-end mb-4">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild><Button>Create New Process</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Create Process</DialogTitle></DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField control={createForm.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} placeholder="Process Title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={createForm.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input {...field} placeholder="Description" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={createForm.control} name="image" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
                    <FormMessage />
                  </FormItem>
                )}/>
                <div className="flex justify-end gap-2">
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ----------------- Processes Table ----------------- */}
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
          {processes.map((p, index) => (
            <TableRow key={p._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {p.image ? (
                  <img
                    src={`${BASE_URL}${p.image}`}
                    alt={p.title}
                    className="w-12 h-12 object-cover rounded cursor-pointer"
                    onClick={() => document.getElementById(`upload-${p._id}`)?.click()}
                  />
                ) : (
                  <div
                    className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs cursor-pointer"
                    onClick={() => document.getElementById(`upload-${p._id}`)?.click()}
                  >
                    Upload
                  </div>
                )}
                <input
                  type="file"
                  id={`upload-${p._id}`}
                  className="hidden"
                  accept="image/*"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    await handleImageUpload(p._id, file)
                  }}
                />
              </TableCell>
              <TableCell>{p.title}</TableCell>
              <TableCell>{p.description}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdateClick(p)}>Update</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(p)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ----------------- Update Dialog ----------------- */}
      <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Update Process</DialogTitle></DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField control={updateForm.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={updateForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={updateForm.control} name="image" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="flex justify-end gap-2">
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ----------------- Delete Dialog ----------------- */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Process</DialogTitle></DialogHeader>
          <p>Are you sure you want to delete <strong>{selectedProcess?.title}</strong>?</p>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={onDeleteConfirm}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
