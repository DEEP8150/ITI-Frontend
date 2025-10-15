import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


type ProgressType = {
    completionRate: number;
    score: number;
    lastModuleViewed: string | null;
    detailedReport: Record<string, any>;
};

type StudentType = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    progress: ProgressType;
    enrolledAt?: string | Date;
};


// type EnrollmentType = {
//   student: StudentType;
// };

export default function CourseStudentsPage() {
    const { courseId } = useParams();
    const [students, setStudents] = useState<StudentType[]>([]);
    const [courseTitle, setCourseTitle] = useState("");
    const [loading, setLoading] = useState(true);

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await axios.get(
                    `${BASE_URL}/instructor/AllStudentsInCourse/${courseId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // directly set students array
                setStudents(res.data.students || []);
                setCourseTitle(res.data.courseTitle || "");
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchStudents();
    }, [courseId]);

    if (loading) return <p>Loading students...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Course: {courseTitle}</h1>
            <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left">Sr.No.</th>
                        <th className="px-4 py-2 text-left">First Name</th>
                        <th className="px-4 py-2 text-left">Last Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Progress</th>
                        <th className="px-4 py-2 text-left">Enrolled At</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? (
                        students.map((s, index) => (
                            <tr key={s._id} className="border-t">
                                <td className="px-4 py-2">{index + 1}</td>
                                <td className="px-4 py-2">{s.firstName}</td>
                                <td className="px-4 py-2">{s.lastName}</td>
                                <td className="px-4 py-2">{s.email}</td>
                                <td className="px-4 py-2">
                                    {s.progress ? `${s.progress.completionRate}%` : "-"}
                                </td>
                                <td className="px-4 py-2">
                                    {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : "-"}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-4 py-4 text-center  text-gray-500">
                                No students enrolled yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
