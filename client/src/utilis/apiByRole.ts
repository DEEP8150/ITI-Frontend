import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL; 

export function axiosByRole(role: string, token: string) {
  const roleBase  =
    role === "admin" || role === "superAdmin"
      ? "/admin"
      : role === "instructor"
      ? "/instructor"
      : "/student";

  return axios.create({
    baseURL: BASE_URL + roleBase,
    headers: { Authorization: `Bearer ${token}` }
  });
}
