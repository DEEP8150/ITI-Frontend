import axios from "axios";
import { axiosByRole } from "./apiByRole";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadImage = async (file: File): Promise<{ fileUrl: string, fileKey: string }> => {
  const token = localStorage.getItem("accessToken");

  if (!token) throw new Error("Not authenticated");

  const role = JSON.parse(atob(token.split(".")[1])).role;
  const api = axiosByRole(role, token);

  // 1) get signed url
  const getUrlRes = await api.post(`/get-upload-url`, {
    fileName: file.name,
    fileType: file.type,
  });

  // const getUrlRes = await axios.post(`${BASE_URL}/admin/get-upload-url`, 
  //     {fileName: file.name,fileType: file.type,},
  //     {headers: { Authorization: `Bearer ${token}` }}
  // );
  console.log("getUrlResponse", getUrlRes)

  const { uploadUrl, fileUrl, fileKey } = getUrlRes.data;

  console.log("uploadUrl", file)

  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
    withCredentials: false
  });

  return { fileUrl, fileKey };
};