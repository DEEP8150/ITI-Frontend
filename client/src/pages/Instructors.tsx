import { useEffect, useState } from "react";
import axios from "axios";
import AppLayout from "@/components/layout/AppLayout";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateUserPage from "./AddNewUser";
import { Button } from "@/components/ui/button";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // dialog state

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BASE_URL}/users/Users?type=instructor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInstructors(res.data);
    } catch (err) {
      console.error(err);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <AppLayout
      title="Instructors"
      // description="List of all instructors"
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Instructor</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Instructor</DialogTitle>
            </DialogHeader>

            {/* CreateUserPage with defaultRole="instructor" */}
            <CreateUserPage
              defaultRole="instructor"
              onSuccess={() => {
                fetchInstructors(); // refresh list
                setOpen(false); // close dialog
              }}
            />
          </DialogContent>
        </Dialog>
      }
    >
      <div className="p-4">
        {/* Instructors Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr. No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors.map((inst, index) => (
              <TableRow key={inst._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {inst.firstName} {inst.lastName}
                </TableCell>
                <TableCell>{inst.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}
