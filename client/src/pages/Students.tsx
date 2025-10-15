import { useEffect, useState } from "react";
import axios from "axios";
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell,} from "@/components/ui/table";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogClose,DialogTrigger,} from "@/components/ui/dialog";
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

export default function StudentsPage() {
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false); // dialog open state

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${BASE_URL}/users/Users?type=student`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("data of stud",res.data)
            setStudents(res.data);
        } catch (err) {
            console.error(err);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-4">
            {/* Top Bar */}
            <div className="flex justify-end mb-4">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Add Student</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                        </DialogHeader>
                        <CreateUserPage
                            defaultRole="student"
                            onSuccess={fetchStudents} // refresh list after adding
                        />
                    </DialogContent>

                </Dialog>
            </div>

            {/* Students Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sr. No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student,index) => (
                        <TableRow key={student._id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                                {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
