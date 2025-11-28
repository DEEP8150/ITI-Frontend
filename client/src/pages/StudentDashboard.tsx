import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import peopleBackground from "/images/material-persons.jpg";
import { axiosByRole } from "@/utilis/apiByRole";
import { jwtDecode } from "jwt-decode";
import { ProjectsTable } from "@/components/dashboard/projects-table";

interface DecodedToken {
    role?: string;
    [key: string]: any;
}

interface Student {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber?: string;
    role?: string;
}

export default function StudentDashboard() {
    const { studentId } = useParams();
    const location = useLocation();

    // 👇 Get student data passed via navigation
    const initialStudent = location.state as Student | null;

    const [student, setStudent] = useState<Student | null>(initialStudent || null);
    const [loading, setLoading] = useState(!initialStudent); // Skip loading if data already available

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) throw new Error("No token found");

                // Decode token to get role
                const decoded = jwtDecode<DecodedToken>(token);
                const role = decoded?.role;
                if (!role) throw new Error("Role missing in token");

                const api = axiosByRole(role, token);

                // 👇 Uncomment this if you want to fetch extra student info (optional)
                // const res = await api.get(`/performance/student/${studentId}/summary`);
                // setStudent(res.data.student || res.data);
            } catch (error) {
                console.error("Error fetching student summary:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!initialStudent && studentId) fetchStudent();
    }, [studentId, initialStudent]);

    if (loading) return <p>Loading student details...</p>;

    return (
        <div className="h-full overflow-y-auto p-6 custom-scrollbar">
            {/* Header Section */}
            <Card className="relative mb-8 border border-stone-200 bg-white overflow-hidden">
                <div
                    className="relative h-64 bg-cover bg-top bg-no-repeat"
                    style={{ backgroundImage: `url(${peopleBackground})` }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 p-8 flex items-center h-full">
                        <div className="max-w-lg text-white">
                            <h2 className="text-3xl font-bold mb-6">Student Details</h2>

                            {student ? (
                                <div className="space-y-2 text-lg leading-relaxed">
                                    <p>
                                        <span className="font-semibold">First Name:</span>{" "}
                                        {student.firstName}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Last Name:</span>{" "}
                                        {student.lastName}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Mobile Number:</span>{" "}
                                        {student.mobileNumber || "N/A"}
                                    </p>
                                </div>
                            ) : (
                                <p>No student data found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Student Details Card */}
            {/* <Card className="border border-stone-200 p-6 bg-white shadow-sm">
        <h3 className="text-2xl font-semibold mb-4 text-stone-700">
          Student Details
        </h3>

        {student ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-stone-500 text-sm">First Name</p>
              <p className="text-stone-900 font-medium">{student.firstName}</p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">Last Name</p>
              <p className="text-stone-900 font-medium">{student.lastName}</p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">Email</p>
              <p className="text-stone-900 font-medium">
                {student.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">Mobile</p>
              <p className="text-stone-900 font-medium">
                {student.mobileNumber || "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <p>No student data found.</p>
        )}
      </Card> */}


            <ProjectsTable />

        </div>
    );
}
