// src/pages/PositionsPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosByRole } from "@/utilis/apiByRole";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { MoreVertical, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { uploadImage } from "@/utilis/UploadImage";

interface Position {
  _id: string;
  title: string;
  image?: string;
  fileKey?: string;
}

interface FormValues {
  title: string;
  image?: File | null;
}

const PositionsPage = () => {
  const { processId } = useParams<{ processId: string }>();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("student");
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(null);

  const createForm = useForm<FormValues>({ defaultValues: { title: "", image: null } });
  const updateForm = useForm<FormValues>({ defaultValues: { title: "", image: null } });

  const fetchPositions = async () => {
    if (!processId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Missing access token");

      const decoded = JSON.parse(atob(token.split(".")[1]));
      setRole(decoded.role || "student");

      const api = axiosByRole(decoded.role, token);
      const res = await api.get(`/processes/${processId}/positions`);
      setPositions(res.data.positions || []);
    } catch (err: any) {
      console.error("Error fetching positions:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to fetch positions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [processId]);

  const onCreateSubmit = async (data: FormValues) => {
    if (!processId) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const api = axiosByRole(decoded.role, token);

      let imageUrl = "";
      let fileKey = "";
      if (data.image) {
        const upload = await uploadImage(data.image);
        imageUrl = upload.fileUrl;
        fileKey = upload.fileKey;
      }

      await api.post(`/processes/${processId}/positions`, { title: data.title, image: imageUrl, fileKey });
      toast({ title: "Position created", description: `${data.title} added successfully.` });

      setOpenCreate(false);
      setCreateImagePreview(null);
      createForm.reset();
      fetchPositions();
    } catch (err: any) {
      console.error("Error creating position:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to create position", variant: "destructive" });
    }
  };

  const handleUpdateClick = (position: Position) => {
    setSelectedPosition(position);
    updateForm.reset({ title: position.title });
    setUpdateImagePreview(position.image || null);
    setOpenUpdate(true);
  };

  const onUpdateSubmit = async (data: FormValues) => {
    if (!selectedPosition) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const api = axiosByRole(decoded.role, token);

      let imageUrl = selectedPosition.image || "";
      if (data.image) {
        const upload = await uploadImage(data.image);
        imageUrl = upload.fileUrl;
      }

      await api.patch(`/positions/${selectedPosition._id}`, { title: data.title, image: imageUrl });
      toast({ title: "Position updated", description: `${data.title} updated successfully.` });

      setOpenUpdate(false);
      setUpdateImagePreview(null);
      fetchPositions();
    } catch (err: any) {
      console.error("Error updating position:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to update position", variant: "destructive" });
    }
  };

  const handleDelete = async (position: Position) => {
    if (!processId) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not authenticated");

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const api = axiosByRole(decoded.role, token);

      await api.delete(`/positions/${position._id}`);
      toast({ title: "Position deleted", description: `${position.title} deleted.` });

      fetchPositions();
    } catch (err: any) {
      console.error("Error deleting position:", err);
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete position", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Positions</h1>

        {role !== "student" && (
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Position</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Position</DialogTitle></DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField control={createForm.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input {...field} placeholder="Position title" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={createForm.control} name="image" render={() => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <input type="file" accept="image/*" onChange={e => createForm.setValue("image", e.target.files?.[0])} />
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
        )}
      </div>

      {/* Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.map((pos) => (
          <Card key={pos._id} className="shadow hover:shadow-lg transition relative">
            <CardHeader className="p-3"><CardTitle>{pos.title}</CardTitle></CardHeader>
            <CardContent className="p-4">
              {pos.image && <img src={pos.image} alt={pos.title} className="w-full h-48 object-cover rounded-md mb-4" />}
              {role !== "student" && (
                <div className="absolute bottom-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdateClick(pos)}>Update</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(pos)} className="text-red-600">Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>Update Position</DialogTitle></DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField control={updateForm.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={updateForm.control} name="image" render={() => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <input type="file" accept="image/*" onChange={e => updateForm.setValue("image", e.target.files?.[0])} />
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
    </div>
  );
};

export default PositionsPage;
