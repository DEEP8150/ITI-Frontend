import { useEffect, useState } from "react"
import axios from "axios"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { uploadImage } from "@/utilis/UploadImage"

type Instructor = {
    _id: string
    firstName: string
    lastName: string
}

type Student = {
    student: {
        firstName: string
        lastName: string
    }
}

type Course = {
    _id: string
    title: string
    description?: string
    instructor: Instructor[]
    students?: Student[]
    isActive: boolean
    totalStudent?: number
    image?: string
}

type FormValues = {
    title: string
    description: string
    instructors: string[]
    image?: File | null
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [instructors, setInstructors] = useState<Instructor[]>([])
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
    const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(null)

    const { toast } = useToast()
    const navigate = useNavigate()

    const form = useForm<FormValues>({
        defaultValues: { title: "", description: "", instructors: [], image: null },
    })

    const updateForm = useForm<FormValues>({
        defaultValues: { title: "", description: "", instructors: [], image: null },
    })

    useEffect(() => {
        fetchCourses()
        fetchInstructors()
    }, [])

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem("accessToken")
            const res = await axios.get(`${BASE_URL}/users/Courses`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const coursesData: Course[] = res?.data?.courses || []
            setCourses(coursesData)
        } catch (err) {
            console.error("Error fetching courses", err)
            setCourses([])
        } finally {
            setLoading(false)
        }
    }


    const handleImageUpload = async (courseId: string, file: File) => {
        try {
            const formData = new FormData()
            formData.append("image", file)
            formData.append("courseId", courseId) // send courseId to identify course

            const token = localStorage.getItem("accessToken")
            await axios.post(`${BASE_URL}/users/image-upload`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            })
            toast({ title: "Image Uploaded" })
            fetchCourses()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to upload image",
                variant: "destructive",
            })
        }
    }


    const fetchInstructors = async () => {
        try {
            const token = localStorage.getItem("accessToken")
            const res = await axios.get(`${BASE_URL}/users/Users?type=instructor`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setInstructors(res.data)
        } catch (err) {
            console.error("Failed to fetch instructors", err)
        }
    }

    // ------------------ Create Course ------------------
    const onSubmit = async (data: FormValues) => {
        try {
            const token = localStorage.getItem("accessToken");
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            data.instructors.forEach(id => formData.append("instructors[]", id));
            if (data.image) formData.append("image", data.image);

            await axios.post(`${BASE_URL}/admin/createCourse`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data", 
                },
            });

            toast({ title: "Course Created" });
            setOpen(false);
            setCreateImagePreview(null);
            fetchCourses();
            form.reset();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to create course",
                variant: "destructive",
            });
        }
    };

    // ------------------ Update Course ------------------
    const handleUpdateClick = (course: Course) => {
        setSelectedCourse(course)
        updateForm.reset({
            title: course.title,
            description: course.description || "",
            instructors: course.instructor.map((i) => i._id),
            image: null,
        })
        setUpdateImagePreview(course.image ? `${BASE_URL}${course.image}` : null)
        setUpdateDialogOpen(true)
    }

    const onUpdateSubmit = async (data: FormValues) => {
        if (!selectedCourse) return
        try {
            const token = localStorage.getItem("accessToken")
            const formData = new FormData()
            formData.append("title", data.title)
            formData.append("description", data.description)
            data.instructors.forEach((id) => formData.append("instructors[]", id))
            if (data.image) formData.append("image", data.image)

            await axios.patch(`${BASE_URL}/admin/courses/${selectedCourse._id}`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            })
            toast({ title: "Course Updated" })
            setUpdateDialogOpen(false)
            setUpdateImagePreview(null)
            fetchCourses()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to update course",
                variant: "destructive",
            })
        }
    }

    // ------------------ Delete / Retrieve ------------------
    const handleDeleteClick = (course: Course) => {
        setSelectedCourse(course)
        setDeleteDialogOpen(true)
    }

    const onDeleteConfirm = async () => {
        if (!selectedCourse) return
        try {
            const token = localStorage.getItem("accessToken")
            await axios.patch(`${BASE_URL}/admin/softDeleteCourses/${selectedCourse._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            })
            toast({ title: "Course Deleted" })
            setDeleteDialogOpen(false)
            fetchCourses()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to delete course",
                variant: "destructive",
            })
        }
    }

    const onRetrieveConfirm = async (course: Course) => {
        try {
            const token = localStorage.getItem("accessToken")
            await axios.patch(`${BASE_URL}/admin/restoreCourse/${course._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            })
            toast({ title: "Course Retrieved" })
            fetchCourses()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to retrieve course",
                variant: "destructive",
            })
        }
    }

    if (loading) return <p>Loading...</p>

    return (
        <div className="p-4">
            {/* ------------------ Create Course Dialog ------------------ */}
            <div className="flex justify-end mb-4">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Create New Course</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create New Course</DialogTitle>
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
                                                <Input {...field} placeholder="Course Title" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Course Description" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* ------------------ Image Upload ------------------ */}
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Image</FormLabel>
                                            <div className="flex items-center gap-4">
                                                {createImagePreview ? (
                                                    <img
                                                        src={createImagePreview}
                                                        alt="Course"
                                                        className="w-24 h-24 object-cover rounded cursor-pointer border"
                                                        onClick={() => document.getElementById("createImageInput")?.click()}
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded cursor-pointer border text-gray-400"
                                                        onClick={() => document.getElementById("createImageInput")?.click()}
                                                    >
                                                        Upload
                                                    </div>
                                                )}
                                                {createImagePreview && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCreateImagePreview(null)
                                                            form.setValue("image", null)
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                id="createImageInput"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setCreateImagePreview(URL.createObjectURL(file))
                                                        form.setValue("image", file)
                                                    }
                                                }}
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

            {/* ------------------ Courses Table ------------------ */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sr. No.</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Courses</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((c, index) => (
                        <TableRow key={c._id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                                {c.image ? (
                                    <img
                                        src={`${BASE_URL}${c.image}`}
                                        alt={c.title}
                                        className="w-12 h-12 object-cover rounded cursor-pointer"
                                        onClick={() => document.getElementById(`upload-${c._id}`)?.click()}
                                    />
                                ) : (
                                    <div
                                        className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded text-xs cursor-pointer"
                                        onClick={() => document.getElementById(`upload-${c._id}`)?.click()} // only open file picker
                                    >
                                        Upload
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id={`upload-${c._id}`}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        try {
                                            // Use the centralized uploadImage utility
                                            const imageUrl = await uploadImage(c._id, file);
                                            if (imageUrl) {
                                                // Update the course's image locally without refetching all courses
                                                setCourses((prev) =>
                                                    prev.map((course) =>
                                                        course._id === c._id ? { ...course, image: imageUrl } : course
                                                    )
                                                );
                                            }
                                        } catch (err: any) {
                                            toast({
                                                title: "Upload failed",
                                                description: err.response?.data?.message || "Failed to upload image",
                                                variant: "destructive",
                                            });
                                        }
                                    }}
                                />

                            </TableCell>
                            <TableCell>
                                <button
                                    className=" hover:underline"
                                    onClick={() => navigate(`/courses/${c._id}/topics`)}
                                >
                                    {c.title}
                                </button>
                            </TableCell>
                            <TableCell>
                                {c.instructor.map((i) => (
                                    <div key={i._id}>
                                        {i.firstName} {i.lastName}
                                    </div>
                                ))}
                            </TableCell>
                            <TableCell>{c.totalStudent ?? 0}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button size="sm" onClick={() => navigate(`/courses/${c._id}/students`)}>
                                    View
                                </Button>
                                {c.isActive ? (
                                    <>
                                        <Button size="sm" onClick={() => handleUpdateClick(c)}>
                                            Update
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(c)}>
                                            Soft Delete
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="secondary" onClick={() => onRetrieveConfirm(c)}>
                                        Retrieve
                                    </Button>
                                )}
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {c.isActive ? "Active" : "Inactive"}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* ------------------ Update Dialog ------------------ */}
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Update Course</DialogTitle>
                    </DialogHeader>
                    <Form {...updateForm}>
                        <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                            <FormField
                                control={updateForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={updateForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={updateForm.control}
                                name="instructors"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructors</FormLabel>
                                        <Select
                                            value={field.value[0]}
                                            onValueChange={(value) => field.onChange([value])}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Instructor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {instructors.map((i) => (
                                                    <SelectItem key={i._id} value={i._id}>
                                                        {i.firstName} {i.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* ------------------ Image Upload ------------------ */}
                            <FormField
                                control={updateForm.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Course Image</FormLabel>
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
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Update</Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ------------------ Delete Dialog ------------------ */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Course</DialogTitle>
                    </DialogHeader>
                    <p>
                        Are you sure you want to In-Activate <strong>{selectedCourse?.title}</strong>?
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={onDeleteConfirm}>Confirm</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
