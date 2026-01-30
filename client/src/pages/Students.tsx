import { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger, } from "@/components/ui/dialog";
import CreateUserPage from "./AddNewUser";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

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
    const navigate = useNavigate();

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await axios.get(`${BASE_URL}/users/Users?type=student`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("data of stud", res.data)
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
        <AppLayout
            title="Students"
            // description="List of all students"
            action={
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button >Add Student</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                        </DialogHeader>
                        <CreateUserPage
                            defaultRole="student"
                            onSuccess={fetchStudents}
                        />
                    </DialogContent>
                </Dialog>
            }
        >
            <div className="">
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
                        {students.map((student, index) => (
                            <TableRow key={student._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => navigate(`/students/${student._id}`, { state: student })}
                                        className="text-blue-600 hover:underline font-medium cursor-pointer"
                                    >
                                        {student.firstName} {student.lastName}
                                    </button>
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
