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
import { axiosByRole } from "@/utilis/apiByRole"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout";

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
    imageUrl?: string;
    fileKey?: string;
}

type FormValues = {
    title: string
    description: string
    instructors: string[]
    image?: File | null
}

// const BASE_URL = import.meta.env.VITE_API_BASE_URL

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
    const [role, setRole] = useState<string>("");

    const { toast } = useToast()
    const navigate = useNavigate()

    const form = useForm<FormValues>({
        defaultValues: { title: "", description: "", instructors: [], image: null },
    })

    const updateForm = useForm<FormValues>({
        defaultValues: { title: "", description: "", instructors: [], image: null },
    })

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            setRole(decoded.role);
        }
        fetchCourses()
        fetchInstructors()
    }, [])

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem("accessToken")
            if (!token) {
                console.error("No token — user not logged in");
                return;
            }

            const role = JSON.parse(atob(token.split('.')[1])).role;

            const api = axiosByRole(role, token);

            const res = await api.get(`/Courses`);

            setCourses(res?.data?.courses || [])
        } catch (err) {
            console.error("Error fetching courses", err)
            setCourses([])
        } finally {
            setLoading(false)
        }
    }

    const fetchInstructors = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;


            const decoded = JSON.parse(atob(token.split(".")[1]));
            const role = decoded.role;

            //here req is going to user not admin/instructor/student later i will check
            const api = axiosByRole(role, token);
            const res = await api.get(`/users?role=instructor`);

            setInstructors(res.data.users);
        } catch (err) {
            console.error("Failed to fetch instructors", err);
        }
    };

    // ------------------ Update Course ------------------



    const onSubmit = async (data: FormValues) => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toast({ title: "Not authenticated", variant: "destructive" });
                return;
            }

            const decoded = JSON.parse(atob(token.split(".")[1]));
            const role = decoded.role;


            const api = axiosByRole(role, token);

            let finalImageUrl: string | undefined;
            let finalFileKey: string | undefined;


            if (data.image) {
                const { fileUrl, fileKey } = await uploadImage(data.image);
                finalImageUrl = fileUrl;
                finalFileKey = fileKey;
            }


            const requestBody: any = {
                title: data.title,
                description: data.description,
                instructor: data.instructors,
                fileKey: finalFileKey,
            };

            const res = await api.post(`/createCourse`, requestBody);

            const newCourse = res.data.course;
            setCourses((prev) => [...prev, newCourse]);
            if (newCourse.image) setCreateImagePreview(newCourse.image);

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


    const handleUpdateClick = (course: Course) => {
        setSelectedCourse(course)
        updateForm.reset({
            title: course.title,
            description: course.description || "",
            instructors: course.instructor.map((i) => i._id),
            image: null,
        })
        setUpdateImagePreview(course.imageUrl || course.image || null);
        setUpdateDialogOpen(true)
    }

    const onUpdateSubmit = async (data: FormValues) => {
        if (!selectedCourse) return;
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toast({ title: "Not authenticated", variant: "destructive" });
                return;
            }

            const decoded = JSON.parse(atob(token.split(".")[1]));
            const role = decoded.role;

            const api = axiosByRole(role, token);

            let finalImageUrl = selectedCourse.image;
            let finalFileKey = selectedCourse.fileKey;

            if (data.image) {
                const { fileUrl, fileKey } = await uploadImage(data.image);
                finalImageUrl = fileUrl;
                finalFileKey = fileKey;
            }

            const requestBody: any = {
                title: data.title,
                description: data.description,
                instructor: data.instructors,
                fileKey: finalFileKey,
            };

            await api.patch(`/courses/${selectedCourse._id}`, requestBody);

            toast({ title: "Course Updated" });
            setUpdateDialogOpen(false);
            setUpdateImagePreview(null);
            fetchCourses()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to update course",
                variant: "destructive",
            });
        }
    };


    // ------------------ Delete / Retrieve ------------------
    const handleDeleteClick = (course: Course) => {
        setSelectedCourse(course)
        setDeleteDialogOpen(true)
    }

    const onDeleteConfirm = async () => {
        if (!selectedCourse) return;
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toast({ title: "Not authenticated", variant: "destructive" });
                return;
            }

            const decoded = JSON.parse(atob(token.split(".")[1]));
            const role = decoded.role;

            const api = axiosByRole(role, token);

            await api.patch(`/softDeleteCourses/${selectedCourse._id}`, {});

            toast({ title: "Course Deleted" });
            setDeleteDialogOpen(false);
            fetchCourses();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to delete course",
                variant: "destructive",
            });
        }
    };


    const onRetrieveConfirm = async (course: Course) => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toast({ title: "Not authenticated", variant: "destructive" });
                return;
            }

            const decoded = JSON.parse(atob(token.split(".")[1]));
            const role = decoded.role;

            const api = axiosByRole(role, token);

            await api.patch(`/restoreCourse/${course._id}`, {});

            toast({ title: "Course Retrieved" });
            fetchCourses();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to retrieve course",
                variant: "destructive",
            });
        }
    };


    if (loading) return <p>Loading...</p>

    return (
        <AppLayout
            title="Courses"
            // description="List of all courses"
            action={
                role !== "student" && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>Create New Course</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create New Course</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">-
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
                )
            }
        >
            <div className="p-1">

                {/* ------------------ Courses Grid ------------------ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-1 ml-4">
                    {courses && courses.length > 0 ? (
                        courses.map((course) => (
                            <Card
                                key={course._id}
                                className="cursor-pointer hover:shadow-lg transition relative"
                                onClick={() => navigate(`/courses/${course._id}/topics`)}
                            >
                                <div className="p-4">
                                    <div className="relative">
                                        {course.imageUrl ? (
                                            <img
                                                src={course.imageUrl}
                                                alt={course.title}
                                                className={`w-full h-60 object-cover rounded-md mb-4 ${role !== "student" ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-100"
                                                    }`}
                                            // onClick={(e) => {
                                            //     e.stopPropagation();
                                            //     if (role !== "student") {
                                            //         document.getElementById(`upload-${course._id}`)?.click();
                                            //     }
                                            // }}
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-60 bg-gray-200 flex items-center justify-center rounded-md mb-4 text-sm cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (role !== "student") {
                                                        document.getElementById(`upload-${course._id}`)?.click();
                                                    }
                                                }}
                                            >
                                                Upload Image
                                            </div>
                                        )}

                                        {/* hidden file input for image upload */}
                                        <input
                                            type="file"
                                            id={`upload-${course._id}`}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                try {
                                                    const { fileUrl, fileKey } = await uploadImage(file);
                                                    setCourses((prev) =>
                                                        prev.map((c) =>
                                                            c._id === course._id ? { ...c, imageUrl: fileUrl, fileKey } : c
                                                        )
                                                    );
                                                    toast({ title: "Image Uploaded" });
                                                } catch (err: any) {
                                                    toast({
                                                        title: "Upload failed",
                                                        description: err?.response?.data?.message || "Failed to upload image",
                                                        variant: "destructive",
                                                    });
                                                }
                                            }}
                                        />

                                        {/* NOTE: move dropdown to the right of instructor name (we render it below) */}
                                    </div>

                                    {/* Title & description */}
                                    <h2 className="text-lg font-semibold mb-2">{course.title}</h2>
                                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>

                                    {/* Status + Instructor + actions (three dots) */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <span
                                            className={`text-xs font-medium px-2 py-1 rounded-full ${course.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {course.isActive ? "Active" : "Inactive"}
                                        </span>

                                        {/* Instructor + three dots aligned horizontally */}
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {course.instructor && course.instructor.length > 0 ? (
                                                <p className="text-xs text-gray-500">
                                                    {course.instructor[0].firstName} {course.instructor[0].lastName}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No instructor</p>
                                            )}

                                            {/* Only show actions for non-students (same as before) */}
                                            {role !== "student" && (
                                                <div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-100">
                                                                <MoreVertical className="h-4 w-4 text-gray-600" />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end">
                                                            {/* View -> navigate to students page (same as your table View button) */}
                                                            <DropdownMenuItem onClick={() => navigate(`/courses/${course._id}/students`)}>
                                                                View
                                                            </DropdownMenuItem>

                                                            {/* Update -> reuse your existing handler that opens update modal */}
                                                            <DropdownMenuItem onClick={() => handleUpdateClick(course)}>
                                                                Update
                                                            </DropdownMenuItem>

                                                            {/* Soft Delete or Retrieve -> reuse your existing handlers */}
                                                            {course.isActive ? (
                                                                <DropdownMenuItem onClick={() => handleDeleteClick(course)}>
                                                                    Soft Delete
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem onClick={() => onRetrieveConfirm(course)}>
                                                                    Retrieve
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 col-span-full">No courses found.</p>
                    )}
                </div>



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
                                {role !== "instructor" && (
                                    <FormField
                                        control={updateForm.control}
                                        name="instructors"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Instructors</FormLabel>
                                                <Select
                                                    value={field.value?.[0]}
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
                                )}

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
        </AppLayout>
    );
}
