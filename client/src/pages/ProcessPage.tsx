// // src/pages/ProcessesPage.tsx
// import { useEffect, useState } from "react"
// import axios from "axios"
// import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog"
// import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { useToast } from "@/hooks/use-toast"
// import { useForm } from "react-hook-form"
// import { useParams } from "react-router-dom"
// import { axiosByRole } from "@/utilis/apiByRole"
// import { uploadImage } from "@/utilis/UploadImage"

// interface Process {
//   _id: string
//   title: string
//   description?: string
//   image?: string
//   imageUrl?: string
//   fileKey?: string;
// }

// interface FormValues {
//   title: string
//   description: string
//   image?: File | null
// }

// // const BASE_URL = import.meta.env.VITE_API_BASE_URL

// export default function ProcessesPage() {
//   const { courseId, topicId, typeId, modeId } = useParams<{
//     courseId: string
//     topicId: string
//     typeId: string
//     modeId: string
//   }>()
//   const { toast } = useToast()

//   const [processes, setProcesses] = useState<Process[]>([])
//   const [loading, setLoading] = useState(true)
//   const [openCreate, setOpenCreate] = useState(false)
//   const [openUpdate, setOpenUpdate] = useState(false)
//   const [openDelete, setOpenDelete] = useState(false)
//   const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
//   const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
//   const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(null)
//   const [role, setRole] = useState<string>("");

//   const createForm = useForm<FormValues>({ defaultValues: { title: "", description: "", image: null } })
//   const updateForm = useForm<FormValues>({ defaultValues: { title: "", description: "", image: null } })

//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       const decoded = JSON.parse(atob(token.split(".")[1]));
//       setRole(decoded.role);
//     }
//     fetchProcesses()
//   }, [modeId])

//   // const fetchProcesses = async () => {
//   //   try {
//   //     setLoading(true)
//   //     const token = localStorage.getItem("accessToken")
//   //     const res = await axios.get(
//   //       `${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes`,
//   //       { headers: { Authorization: `Bearer ${token}` } }
//   //     )
//   //     setProcesses(res.data.processes)
//   //   } catch (err) {
//   //     console.error(err)
//   //     toast({ title: "Failed to fetch processes", variant: "destructive" })
//   //   } finally {
//   //     setLoading(false)
//   //   }
//   // }

//   const fetchProcesses = async () => {
//     try {
//       setLoading(true);

//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         toast({ title: "Not authenticated", variant: "destructive" });
//         return;
//       }

//       const decoded = JSON.parse(atob(token.split(".")[1]));
//       const role = decoded.role;

//       const api = axiosByRole(role, token);

//       const res = await api.get(
//         `/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes`
//       );

//       setProcesses(res.data.processes || []);

//     } catch (err: any) {
//       console.error("Failed to fetch processes:", err);
//       toast({
//         title: "Error",
//         description: err.response?.data?.message || "Failed to fetch processes",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };


//   // const handleImageUpload = async (processId: string, file: File) => {
//   //   try {
//   //     const formData = new FormData()
//   //     formData.append("image", file)

//   //     const token = localStorage.getItem("accessToken")
//   //     await axios.patch(
//   //       `${BASE_URL}/admin/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes/${processId}`,
//   //       formData,
//   //       { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
//   //     )
//   //     toast({ title: "Image uploaded" })
//   //     fetchProcesses()
//   //   } catch (err: any) {
//   //     toast({ title: "Error", description: err.response?.data?.message || "Failed to upload image", variant: "destructive" })
//   //   }
//   // }

//   const handleImageUpload = async (processId: string, file: File) => {
//     try {
//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         toast({ title: "Not authenticated", variant: "destructive" });
//         return;
//       }
//       const decoded = JSON.parse(atob(token.split(".")[1]));
//       const role = decoded.role;
//       const api = axiosByRole(role, token);

//       const { fileUrl, fileKey } = await uploadImage(file);

//       await api.patch(
//         `/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes/${processId}`,
//         { image: fileUrl, fileKey }
//       );

//       toast({ title: "Image uploaded successfully" });
//       fetchProcesses();

//     } catch (err: any) {
//       console.error("Error uploading process image:", err);
//       toast({
//         title: "Error",
//         description: err.response?.data?.message || "Failed to upload image",
//         variant: "destructive",
//       });
//     }
//   };

//   const onCreateSubmit = async (data: FormValues) => {
//     try {
//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         toast({ title: "Not authenticated", variant: "destructive" });
//         return;
//       }
//       const decoded = JSON.parse(atob(token.split(".")[1]));
//       const role = decoded.role;
//       const api = axiosByRole(role, token);

//       let image = "";
//       let fileKey = "";

//       if (data.image) {
//         const { fileUrl, fileKey: uploadedKey } = await uploadImage(data.image);
//         image = fileUrl;
//         fileKey = uploadedKey;
//       }
//       await api.post(
//         `/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes`,
//         {
//           title: data.title,
//           description: data.description,
//           image,
//           fileKey
//         }
//       );

//       toast({ title: "Process created successfully" });
//       setOpenCreate(false);
//       setCreateImagePreview(null);
//       createForm.reset();
//       fetchProcesses();

//     } catch (err: any) {
//       console.error("Error creating process:", err);
//       toast({
//         title: "Error",
//         description: err.response?.data?.message || "Failed to create process",
//         variant: "destructive",
//       });
//     }
//   };


//   const handleUpdateClick = (process: Process) => {
//     setSelectedProcess(process);
//     updateForm.reset({
//       title: process.title,
//       description: process.description || "",
//       image: null,
//     });
//     setUpdateImagePreview(process.image || null);
//     setOpenUpdate(true);
//   };


//   const onUpdateSubmit = async (data: FormValues) => {
//     if (!selectedProcess) return;

//     try {
//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         toast({ title: "Not authenticated", variant: "destructive" });
//         return;
//       }

//       const role = JSON.parse(atob(token.split(".")[1])).role;
//       const api = axiosByRole(role, token);

//       // Keep old image if no new one is uploaded
//       let finalFileKey: string | undefined = selectedProcess.image;

//       // If new image uploaded → upload to S3 first
//       if (data.image) {
//         const { fileKey } = await uploadImage(data.image);
//         finalFileKey = fileKey;
//       }

//       // Update process document
//       await api.patch(
//         `/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes/${selectedProcess._id}`,
//         {
//           title: data.title,
//           description: data.description,
//           image: finalFileKey, // send fileKey only
//         },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       toast({ title: "Process updated" });
//       setOpenUpdate(false);
//       setUpdateImagePreview(null);
//       updateForm.reset({ title: "", description: "", image: null });
//       fetchProcesses();

//     } catch (err: any) {
//       toast({
//         title: "Error",
//         description:
//           err.response?.data?.message || "Failed to update process",
//         variant: "destructive",
//       });
//     }
//   };



//   const handleDeleteClick = (process: Process) => {
//     setSelectedProcess(process)
//     setOpenDelete(true)
//   }

//   const onDeleteConfirm = async () => {
//     if (!selectedProcess) return;

//     try {
//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         toast({ title: "Not authenticated", variant: "destructive" });
//         return;
//       }

//       // Extract user role from token (same pattern as topic)
//       const role = JSON.parse(atob(token.split(".")[1])).role;
//       const api = axiosByRole(role, token);

//       await api.delete(
//         `/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}/processes/${selectedProcess._id}`
//       );

//       toast({ title: "Process deleted" });
//       setOpenDelete(false);
//       fetchProcesses();

//     } catch (err: any) {
//       toast({
//         title: "Error",
//         description: err.response?.data?.message || "Failed to delete process",
//         variant: "destructive",
//       });
//     }
//   };


//   if (loading) return <p>Loading...</p>

//   return (
//     <div className="p-4">
//       {/* ----------------- Create Process Dialog ----------------- */}
//       {role !== "student" && (
//         <div className="flex justify-end mb-4">
//           <Dialog open={openCreate} onOpenChange={setOpenCreate}>
//             <DialogTrigger asChild><Button>Create New Process</Button></DialogTrigger>
//             <DialogContent className="sm:max-w-lg">
//               <DialogHeader><DialogTitle>Create Process</DialogTitle></DialogHeader>
//               <Form {...createForm}>
//                 <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
//                   <FormField control={createForm.control} name="title" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Title</FormLabel>
//                       <FormControl><Input {...field} placeholder="Process Title" /></FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                   <FormField control={createForm.control} name="description" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description</FormLabel>
//                       <FormControl><Input {...field} placeholder="Description" /></FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                   <FormField control={createForm.control} name="image" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Image</FormLabel>
//                       <input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                   <div className="flex justify-end gap-2">
//                     <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
//                     <Button type="submit">Create</Button>
//                   </div>
//                 </form>
//               </Form>
//             </DialogContent>
//           </Dialog>
//         </div>
//       )}

//       {/* ----------------- Processes Table ----------------- */}
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Sr. No.</TableHead>
//             <TableHead>Image</TableHead>
//             <TableHead>Title</TableHead>
//             <TableHead>Description</TableHead>
//             {role !== "student" && <TableHead>Actions</TableHead>}
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {processes.map((p, index) => (
//             <TableRow key={p._id}>
//               <TableCell>{index + 1}</TableCell>
//               <TableCell>
//                 {p.imageUrl ? (
//                   <img
//                     src={`${p.imageUrl}`}
//                     alt={p.title}
//                     className={`w-12 h-12 object-cover rounded ${role !== "student" ? "cursor-pointer" : "cursor-default"}`}
//                     onClick={() => {
//                       if (role !== "student") {
//                         document.getElementById(`upload-${p._id}`)?.click();
//                       }
//                     }}
//                   />
//                 ) : (
//                   <div
//                     className={`w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs ${role !== "student" ? "cursor-pointer" : "cursor-default"
//                       }`}
//                     onClick={() => {
//                       if (role !== "student") {
//                         document.getElementById(`upload-${p._id}`)?.click();
//                       }
//                     }}
//                   >
//                     {role !== "student" ? "Upload" : "No Image"}
//                   </div>
//                 )}

//                 <input
//                   type="file"
//                   id={`upload-${p._id}`}
//                   className="hidden"
//                   accept="image/*"
//                   onChange={async e => {
//                     const file = e.target.files?.[0]
//                     if (!file) return
//                     await handleImageUpload(p._id, file)
//                   }}
//                 />
//               </TableCell>
//               <TableCell>{p.title}</TableCell>
//               <TableCell>{p.description}</TableCell>
//               {role !== "student" && (
//                 <TableCell className="flex gap-2">
//                   <Button size="sm" onClick={() => handleUpdateClick(p)}>Update</Button>
//                   <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(p)}>Delete</Button>
//                 </TableCell>
//               )}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       {/* ----------------- Update Dialog ----------------- */}
//       <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader><DialogTitle>Update Process</DialogTitle></DialogHeader>
//           <Form {...updateForm}>
//             <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
//               <FormField control={updateForm.control} name="title" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Title</FormLabel>
//                   <FormControl><Input {...field} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />
//               <FormField control={updateForm.control} name="description" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl><Input {...field} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />
//               <FormField control={updateForm.control} name="image" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Image</FormLabel>
//                   <input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
//                   <FormMessage />
//                 </FormItem>
//               )} />
//               <div className="flex justify-end gap-2">
//                 <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
//                 <Button type="submit">Update</Button>
//               </div>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>

//       {/* ----------------- Delete Dialog ----------------- */}
//       <Dialog open={openDelete} onOpenChange={setOpenDelete}>
//         <DialogContent className="sm:max-w-sm">
//           <DialogHeader><DialogTitle>Delete Process</DialogTitle></DialogHeader>
//           <p>Are you sure you want to delete <strong>{selectedProcess?.title}</strong>?</p>
//           <div className="flex justify-end gap-2 mt-4">
//             <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
//             <Button variant="destructive" onClick={onDeleteConfirm}>Confirm</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosByRole } from "@/utilis/apiByRole";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { uploadImage } from "@/utilis/UploadImage";

interface Process {
  _id: string;
  title: string;
  image?: string;
  typeTitles: string[];
  modeTitles: string[];
  imageUrl?: string;
  fileKey?: string;
}

interface FormValues {
  title: string;
  image?: File | null;
}

const ProcessesPage = () => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState<any>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("student");
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);

  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(null);

  const createForm = useForm<FormValues>({
    defaultValues: { title: "", image: null },
  });

  const updateForm = useForm<FormValues>({
    defaultValues: { title: "", image: null },
  });

  const fetchFullHierarchy = async () => {
    if (!topicId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Missing access token");

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const userRole = decoded.role || "student";
      setRole(userRole);

      const api = axiosByRole(userRole, token);
      const res = await api.get(`/topics/${topicId}/full-data`);


      const data = res.data;
      setTopic(data.topic);

      let finalImageUrl: string | undefined;
      let finalFileKey: string | undefined;

      if (data.image) {
        const { fileUrl, fileKey } = await uploadImage(data.image);
        finalImageUrl = fileUrl;
        finalFileKey = fileKey;
      }

      const processMap: Record<string, Process> = {};
      data.types.forEach((type: any) => {
        type.modes.forEach((mode: any) => {
          mode.processes.forEach((process: any) => {
            if (!processMap[process._id]) {
              processMap[process._id] = {
                _id: process._id,
                title: process.title,
                image: process.imageUrl || "",
                fileKey: process.fileKey,
                typeTitles: [type.title],
                modeTitles: [mode.title],
              };
            } else {
              if (!processMap[process._id].typeTitles.includes(type.title))
                processMap[process._id].typeTitles.push(type.title);
              if (!processMap[process._id].modeTitles.includes(mode.title))
                processMap[process._id].modeTitles.push(mode.title);
            }
          });
        });
      });

      setProcesses(Object.values(processMap));
    } catch (err) {
      console.error("Error fetching full hierarchy:", err);
      toast({
        title: "Error loading data",
        description: "Could not fetch topic hierarchy.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  // Fetch data
  useEffect(() => {
    fetchFullHierarchy();
  }, [topicId]);

  const handleUpdateClick = (process: Process) => {
    setSelectedProcess(process);
    updateForm.reset({ title: process.title });
    setUpdateImagePreview(process.image || null);
    setOpenUpdate(true);
  };

  const handleDelete = async (process: Process) => {
    toast({
      title: "Process deleted",
      description: `${process.title} has been deleted.`,
    });
  };

  const onCreateSubmit = async (data: FormValues) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const userRole = decoded.role || "student";
      const api = axiosByRole(userRole, token);

      let imageUrl = "";
      let fileKey = "";


      if (data.image) {
        const { fileUrl, fileKey: uploadedKey } = await uploadImage(data.image);
        imageUrl = fileUrl;
        fileKey = uploadedKey;
      }
      console.log("for creating", token, userRole, imageUrl, fileKey, data)

      await api.post(`/topics/${topicId}/processes`, {
        title: data.title,
        image: imageUrl
      });


      toast({
        title: "Process created",
        description: `${data.title} added successfully.`,
      });
      await fetchFullHierarchy();

      setOpenCreate(false);
      createForm.reset();
      setCreateImagePreview(null);
    } catch (err: any) {
      console.error("Error creating process:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create process",
        variant: "destructive",
      });
    }
  };


  const onUpdateSubmit = (data: FormValues) => {
    toast({
      title: "Process updated",
      description: `${data.title} updated successfully.`,
    });
    setOpenUpdate(false);
    setUpdateImagePreview(null);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{topic?.title || "Topic Details"}</h1>

        {role !== "student" && (
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Process
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Process</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter process title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Custom Image Upload (Reference Style) */}
                  <FormField
                    control={createForm.control}
                    name="image"
                    render={() => (
                      <FormItem>
                        <FormLabel>Process Image</FormLabel>
                        <div className="flex items-center gap-4">
                          {createImagePreview ? (
                            <img
                              src={createImagePreview}
                              alt="Preview"
                              className="w-24 h-24 object-cover rounded cursor-pointer border"
                              onClick={() =>
                                document.getElementById("createImageInput")?.click()
                              }
                            />
                          ) : (
                            <div
                              className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded cursor-pointer border text-gray-400"
                              onClick={() =>
                                document.getElementById("createImageInput")?.click()
                              }
                            >
                              Upload
                            </div>
                          )}
                          {createImagePreview && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setCreateImagePreview(null);
                                createForm.setValue("image", null);
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
                            const file = e.target.files?.[0];
                            if (file) {
                              setCreateImagePreview(URL.createObjectURL(file));
                              createForm.setValue("image", file);
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
        )}
      </div>

      {/* Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processes.map((proc) => (
          <Card key={proc._id} className="shadow hover:shadow-lg transition relative">
            <CardHeader className="p-3">
              <CardTitle className="text-lg font-semibold">{proc.title}</CardTitle>
            </CardHeader>

            <CardContent className="p-4 pb-16">
              <img
                src={proc.image}
                alt={proc.title}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <div className="flex flex-wrap gap-2 mb-2">
                {proc.typeTitles.map((type) => (
                  <>
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  </>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {proc.modeTitles.map((mode) => (
                  <Badge key={mode} variant="outline">
                    {mode}
                  </Badge>
                ))}
              </div>

              {/* Three dots bottom-right */}
              {role !== "student" && (
                <div className="absolute bottom-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdateClick(proc)}>
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(proc)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Update Dialog */}
      <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Process</DialogTitle>
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
                      <Input {...field} placeholder="Enter process title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Update Image Upload (same style) */}
              <FormField
                control={updateForm.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Process Image</FormLabel>
                    <div className="flex items-center gap-4">
                      {updateImagePreview ? (
                        <img
                          src={updateImagePreview}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded cursor-pointer border"
                          onClick={() =>
                            document.getElementById("updateImageInput")?.click()
                          }
                        />
                      ) : (
                        <div
                          className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded cursor-pointer border text-gray-400"
                          onClick={() =>
                            document.getElementById("updateImageInput")?.click()
                          }
                        >
                          Upload
                        </div>
                      )}
                      {updateImagePreview && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setUpdateImagePreview(null);
                            updateForm.setValue("image", null);
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
                        const file = e.target.files?.[0];
                        if (file) {
                          setUpdateImagePreview(URL.createObjectURL(file));
                          updateForm.setValue("image", file);
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
    </div>
  );
};

export default ProcessesPage;


