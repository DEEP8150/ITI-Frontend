import axios from "axios"
import { toast } from "@/hooks/use-toast"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const uploadImage = async (courseId: string, file: File): Promise<string | null> => {
  try {
    const formData = new FormData()
    formData.append("image", file)
    formData.append("courseId", courseId)

    const token = localStorage.getItem("accessToken")
    const res = await axios.post(`${BASE_URL}/users/image-upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })

    toast({ title: "Image uploaded successfully" })
    return res.data.url
  } catch (err: any) {
    toast({
      title: "Upload failed",
      description: err.response?.data?.message || "Failed to upload image",
      variant: "destructive",
    })
    return null
  }
}

export {uploadImage}