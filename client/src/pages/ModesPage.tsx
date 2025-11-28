import { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { axiosByRole } from "@/utilis/apiByRole";
import { uploadImage } from "@/utilis/UploadImage";

interface Mode {
  _id: string;
  title: string;
  image?: string;
  imageUrl?: string
  fileKey?: string;
}

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ModesPage() {
  const { courseId, topicId, typeId } = useParams<{ courseId: string; topicId: string; typeId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [modes, setModes] = useState<Mode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModes();
  }, [typeId]);

  const fetchModes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")
      if (!token) return toast({ title: "Not authenticated", variant: "destructive" })

      const decoded = JSON.parse(atob(token.split(".")[1]))
      const role = decoded.role
      const api = axiosByRole(role, token)

      const res = await api.get(`/courses/${courseId}/topics/${topicId}/types/${typeId}/modes`)
      setModes(res.data.modes)
    } catch (err) {
      console.error(err)
      toast({ title: "Failed to fetch modes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (modeId: string, file: File) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return toast({ title: "Not authenticated", variant: "destructive" })

      const decoded = JSON.parse(atob(token.split(".")[1]))
      const role = decoded.role
      const api = axiosByRole(role, token)

      const { fileUrl, fileKey } = await uploadImage(file)

      await api.patch(`/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${modeId}`, {
        image: fileUrl,
        fileKey,
      })

      toast({ title: "Image uploaded successfully" })
      fetchModes()
    } catch (err: any) {
      console.error("Image upload failed:", err)
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      })
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr. No.</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modes.map((m, index) => (
            <TableRow key={m._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {m.imageUrl  ? (
                  <img
                    src={`${m.imageUrl }`}
                    alt={m.title}
                    className="w-12 h-12 object-cover rounded cursor-pointer"
                    onClick={() => document.getElementById(`upload-${m._id}`)?.click()}
                  />
                ) : (
                  <div
                    className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs cursor-pointer"
                    onClick={() => document.getElementById(`upload-${m._id}`)?.click()}
                  >
                    Upload
                  </div>
                )}
                <input
                  type="file"
                  id={`upload-${m._id}`}
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await handleImageUpload(m._id, file);
                  }}
                />
              </TableCell>
              <TableCell>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() =>
                    navigate(`/courses/${courseId}/topics/${topicId}/types/${typeId}/modes/${m._id}/processes`)
                  }
                >
                  {m.title}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
