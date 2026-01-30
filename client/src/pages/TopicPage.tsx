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
import { axiosByRole } from "@/utilis/apiByRole"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Plus } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout";

interface Topic {
  _id: string
  title: string
  description?: string
  image?: string
  imageUrl?: string
  fileKey?: string;
}

interface FormValues {
  title: string
  description: string
  image?: File | null
}

// const BASE_URL = import.meta.env.VITE_API_BASE_URL

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
  const [role, setRole] = useState<string>("");

  const form = useForm<FormValues>({ defaultValues: { title: "", description: "", image: null } })
  const updateForm = useForm<FormValues>({ defaultValues: { title: "", description: "", image: null } })

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setRole(decoded.role);
    }
    fetchTopics()
  }, [courseId])

  const fetchTopics = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast({ title: "Not authenticated", variant: "destructive" });
        return;
      }

      const role = JSON.parse(atob(token.split(".")[1])).role;

      const api = axiosByRole(role, token);

      const res = await api.get(`/courses/${courseId}/topics`);

      setTopics(res.data?.topics || res.data);
    } catch (err) {
      console.error("Error fetching topics:", err);
      toast({ title: "Failed to fetch topics", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  // const handleImageUpload = async (topicId: string, file: File) => {
  //   try {
  //     const formData = new FormData()
  //     formData.append("image", file)

  //     const token = localStorage.getItem("accessToken")
  //     const res = await axios.patch(`${BASE_URL}/admin/courses/${courseId}/topics/${topicId}`, formData, {
  //       headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  //     })
  //     toast({ title: "Image uploaded" })
  //     fetchTopics()
  //   } catch (err: any) {
  //     toast({ title: "Error", description: err.response?.data?.message || "Failed to upload image", variant: "destructive" })
  //   }
  // }


  const handleImageUpload = async (topicId: string, file: File) => {
    try {
      const { fileKey } = await uploadImage(file)
      const token = localStorage.getItem("accessToken")
      if (!token) {
        toast({ title: "Not authenticated", variant: "destructive" })
        return
      }
      const role = JSON.parse(atob(token.split(".")[1])).role
      const api = axiosByRole(role, token)

      await api.patch(
        `/courses/${courseId}/topics/${topicId}`,
        { image: fileKey }
      )
      toast({ title: "Image saved" })
      fetchTopics()

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      })
    }
  }



  // const onSubmit = async (data: FormValues) => {
  //   try {
  //     const formData = new FormData()
  //     formData.append("title", data.title)
  //     formData.append("description", data.description)
  //     if (data.image) formData.append("image", data.image)

  //     const token = localStorage.getItem("accessToken")
  //     if (!token) {
  //     toast({ title: "Not authenticated", variant: "destructive" });
  //     return;
  //   }

  //   const role = JSON.parse(atob(token.split(".")[1])).role;
  //   const api = axiosByRole(role, token);

  //   await api.post(`/courses/${courseId}/topics`, formData, {
  //     headers: { "Content-Type": "multipart/form-data" }, 
  //   });

  //     toast({ title: "Topic created" })
  //     setOpen(false)
  //     setCreateImagePreview(null)
  //     form.reset()
  //     fetchTopics()
  //   } catch (err: any) {
  //     toast({ title: "Error", description: err.response?.data?.message || "Failed to create topic", variant: "destructive" })
  //   }
  // }

  const onSubmit = async (data: FormValues) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast({ title: "Not authenticated", variant: "destructive" });
        return;
      }

      let finalImageUrl: string | undefined;
      let finalFileKey: string | undefined;

      // --- Upload image to S3 (if any) just like course ---
      if (data.image) {
        const { fileUrl, fileKey } = await uploadImage(data.image);
        finalImageUrl = fileUrl;
        finalFileKey = fileKey;
      }

      // --- Prepare JSON body (NO FormData) ---
      const requestBody: any = {
        title: data.title,
        description: data.description,
        fileKey: finalFileKey, // only if image existed
      };

      const res = await axiosByRole(JSON.parse(atob(token.split(".")[1])).role, token)
        .post(`/courses/${courseId}/topics`, requestBody, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

      const newCourse = res.data.course;
      setTopics((prev) => [...prev, newCourse]);
      if (newCourse.image) setCreateImagePreview(newCourse.image);

      toast({ title: "Topic created" });

      setOpen(false);
      setCreateImagePreview(null);
      fetchTopics();
      form.reset();

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create topic",
        variant: "destructive",
      });
    }
  };


  const handleUpdateClick = (topic: Topic) => {
    setSelectedTopic(topic)
    updateForm.reset({ title: topic.title, description: topic.description || "", image: null })
    setUpdateImagePreview(topic.imageUrl || topic.image || null)
    setUpdateDialogOpen(true)
  }

  // const onUpdateSubmit = async (data: FormValues) => {
  //   if (!selectedTopic) return
  //   try {
  //     const formData = new FormData()
  //     formData.append("title", data.title)
  //     formData.append("description", data.description)
  //     if (data.image) formData.append("image", data.image)

  //     const token = localStorage.getItem("accessToken")
  //     await axios.patch(`${BASE_URL}/admin/courses/${courseId}/topics/${selectedTopic._id}`, formData, {
  //       headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  //     })
  //     toast({ title: "Topic updated" })
  //     setUpdateDialogOpen(false)
  //     setUpdateImagePreview(null)
  //     fetchTopics()
  //   } catch (err: any) {
  //     toast({ title: "Error", description: err.response?.data?.message || "Failed to update topic", variant: "destructive" })
  //   }
  // }

  const onUpdateSubmit = async (data: FormValues) => {
    if (!selectedTopic) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast({ title: "Not authenticated", variant: "destructive" });
        return;
      }

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role = decoded.role;

      const api = axiosByRole(role, token);

      let finalImageUrl = selectedTopic.image;
      let finalFileKey = selectedTopic.fileKey;

      // If NEW image uploaded → upload to S3 first
      if (data.image) {
        const { fileUrl, fileKey } = await uploadImage(data.image);
        finalImageUrl = fileUrl;
        finalFileKey = fileKey;
      }

      const requestBody: any = {
        title: data.title,
        description: data.description,
        fileKey: finalFileKey,
      };

      // Send only json body
      await api.patch(`/courses/${courseId}/topics/${selectedTopic._id}`, requestBody);

      toast({ title: "Topic updated" });
      setUpdateDialogOpen(false);
      setUpdateImagePreview(null);
      fetchTopics();

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update topic",
        variant: "destructive",
      });
    }
  };


  const handleDeleteClick = (topic: Topic) => {
    setSelectedTopic(topic)
    setDeleteDialogOpen(true)
  }

  // const onDeleteConfirm = async () => {
  //   if (!selectedTopic) return
  //   try {
  //     const token = localStorage.getItem("accessToken")
  //     await axios.delete(`${BASE_URL}/admin/courses/${courseId}/topics/${selectedTopic._id}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     toast({ title: "Topic deleted" })
  //     setDeleteDialogOpen(false)
  //     fetchTopics()
  //   } catch (err: any) {
  //     toast({ title: "Error", description: err.response?.data?.message || "Failed to delete topic", variant: "destructive" })
  //   }
  // }

  const onDeleteConfirm = async () => {
    if (!selectedTopic) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast({ title: "Unauthenticated", variant: "destructive" });
        return;
      }

      const role = JSON.parse(atob(token.split(".")[1])).role;
      const api = axiosByRole(role, token);

      await api.delete(`/courses/${courseId}/topics/${selectedTopic._id}`);

      toast({ title: "Topic deleted" });
      setDeleteDialogOpen(false);
      fetchTopics();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete topic",
        variant: "destructive",
      });
    }
  };


  if (loading) return <p>Loading...</p>

  return (
    <AppLayout
      title="Topics"
      description="Manage topics for this course"
      action={
        role !== "student" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create New Topic
              </Button>
            </DialogTrigger>
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
        )
      }
    >
      <div className="p-1">

        {/* <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr. No.</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            {role !== "student" && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((t, index) => (
            <TableRow key={t._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>

                {t.imageUrl ? (
                  <img
                    src={t.imageUrl}
                    alt={t.title}
                    className={`w-12 h-12 object-cover rounded ${role === "student" ? "cursor-default" : "cursor-pointer"
                      }`}
                    onClick={() => {
                      if (role !== "student")
                        document.getElementById(`upload-${t._id}`)?.click()
                    }}
                  />
                ) : (
                  <div
                    className={`w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs ${role === "student" ? "cursor-default" : "cursor-pointer"
                      }`}
                    onClick={() => {
                      if (role !== "student")
                        document.getElementById(`upload-${t._id}`)?.click()
                    }}
                  >
                    Upload
                  </div>
                )}
                <input type="file" id={`upload-${t._id}`} className="hidden" accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return
                    await handleImageUpload(t._id, file)
                  }}
                  disabled={role === "student"}
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
              {role !== "student" && (
                <TableCell className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdateClick(t)}>Update</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(t)}>Delete</Button>
                </TableCell>
              )}

            </TableRow>
          ))}
        </TableBody>
      </Table> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {topics && topics.length > 0 ? (
            topics.map((t) => (
              <Card
                key={t._id}
                className="cursor-pointer hover:shadow-lg transition"
                // onClick={() => navigate(`/courses/${courseId}/topics/${t._id}/types`)}
                onClick={() => navigate(`/courses/${courseId}/topics/${t._id}/details`)}
              >
                <div className="p-4">

                  <div className="relative">
                    <img
                      src={t.imageUrl || ""}
                      alt={t.title}
                      className="w-full h-60 object-cover rounded-md mb-4"
                    />

                  </div>
                  <h2 className="text-lg font-semibold mb-2">{t.title}</h2>

                  {role !== "student" && (
                    <div className="mt-3 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()} // prevent card navigation
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateClick(t);
                            }}
                          >
                            Update
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(t);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">No topics found.</p>
          )}
        </div>


        {/* ------------------ Update Dialog ------------------ */}
        {role !== "student" && (
          <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Update Topic</DialogTitle>
              </DialogHeader>
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
                  <FormField
                    control={updateForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic Image</FormLabel>
                        <div className="flex items-center gap-4">
                          {updateImagePreview ? (
                            <img
                              src={updateImagePreview}
                              alt="Course"
                              className="w-24 h-24 object-cover rounded cursor-pointer border"
                              onClick={() => document.getElementById("updateImageInput")?.click()}
                            />
                          ) : (
                            <div
                              className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded cursor-pointer border text-gray-400"
                              onClick={() => document.getElementById("updateImageInput")?.click()}
                            >
                              Upload
                            </div>
                          )}
                          {updateImagePreview && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setUpdateImagePreview(null)
                                updateForm.setValue("image", null)
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <input
                          type="file"
                          id="updateImageInput"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setUpdateImagePreview(URL.createObjectURL(file))
                              updateForm.setValue("image", file)
                            }
                          }}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Update</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}

        {/* ------------------ Delete Dialog ------------------ */}
        {role !== "student" && (
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
        )}
      </div>
    </AppLayout >
  )
}
