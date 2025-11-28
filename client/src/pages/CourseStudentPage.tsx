import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { axiosByRole } from "@/utilis/apiByRole";
import { Collapse, Pagination, Popover, Calendar } from "antd";
import type { CollapseProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
// import { Calendar } from "lucide-react";
import { CalendarOutlined } from "@ant-design/icons";

type ProcessSummary = {
  processId: string;
  processName: string;
  topicName: string;
  totalAttempts: number;
  latestAttempt?: string;
};

type AttemptData = {
  _id: string;
  process: { title: string };
  attemptNumber: number;
  createdAt: string;
  performanceData: Record<string, string | number>;
};

type StudentType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type AllStudentType = {
  id: string;
  name: string;
  email: string;
  organization?: string;
};

export default function CourseStudentsPage() {
  const { toast } = useToast();
  const { courseId } = useParams();

  const [students, setStudents] = useState<StudentType[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // --- Add Student Dialog ---
  const [open, setOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<AllStudentType[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // --- View Student Performance Dialogs ---
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [attemptsOpen, setAttemptsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(
    null
  );
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  const [performanceSummary, setPerformanceSummary] = useState<
    ProcessSummary[]
  >([]);
  const [attemptsData, setAttemptsData] = useState<AttemptData[]>([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);


  const [topics, setTopics] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const filteredAttempts = attemptsData.filter((a) => {
    const attemptDate = dayjs(a.createdAt).format("YYYY-MM-DD");
    return attemptDate === selectedDate.format("YYYY-MM-DD");
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("accessToken");



  const fetchTopicsAndTypes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const api = axiosByRole("admin", token!); // or "instructor" if that route exists

      // Fetch topics for this course
      const topicsRes = await api.get(`/courses/${courseId}/topics`);
      setTopics(topicsRes.data.topics || []);

      // If a topic is selected, fetch types under that topic
      if (selectedTopic) {
        const typesRes = await api.get(
          `/courses/${courseId}/topics/${selectedTopic}/types`
        );
        setTypes(typesRes.data.types || []);
      } else {
        setTypes([]); // no topic selected yet
      }
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };


  useEffect(() => {
    if (selectedTopic) {
      fetchTopicsAndTypes();
    }
  }, [selectedTopic]);

  // -------------------------------
  // Fetch all enrolled students
  // -------------------------------
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/instructor/AllStudentsInCourse/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(res.data.students || []);
      setCourseTitle(res.data.courseTitle || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Fetch all students (for Add popup)
  // -------------------------------
  const fetchAllStudents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/instructor/all-students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllStudents(res.data.studentList || []);
    } catch (err) {
      console.error("Error fetching all students:", err);
    }
  };

  // -------------------------------
  // Enroll students to course
  // -------------------------------
  const handleConfirmEnroll = async () => {
    try {
      for (const studentId of selectedStudents) {
        await axios.post(
          `${BASE_URL}/instructor/courses/${courseId}/enrollStudents`,
          { studentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast({ title: "Students enrolled successfully!" });
      setOpen(false);
      setSelectedStudents([]);
      fetchStudents();
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast({
        title: "Error enrolling students",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // -------------------------------
  // Fetch performance summary for student
  // -------------------------------
  const fetchStudentPerformanceSummary = async (studentId: string) => {
  if (!studentId) return console.error("Missing studentId");

  try {
    setLoadingPerformance(true);
    const token = localStorage.getItem("accessToken");
    const decoded = JSON.parse(atob(token!.split(".")[1]));
    const role = decoded.role || "student";

    const api = axiosByRole(role, token!);

    const res = await api.get(
      `/performance/student/${studentId}/summary`,
      { params: { topicId: selectedTopic, typeId: selectedType } }
    );

    setPerformanceSummary(res.data || []);
  } catch (err) {
    console.error("Error fetching student summary:", err);
    toast({
      title: "Error loading data",
      description: "Could not fetch process summary.",
      variant: "destructive",
    });
  } finally {
    setLoadingPerformance(false);
  }
};

  // -------------------------------
  // Fetch attempts by process
  // -------------------------------
  const fetchAttemptsByProcess = async (studentId: string, processId: string) => {
    if (!studentId || !processId) return console.error("Missing studentId or processId");

    try {
      setLoadingPerformance(true);
      const token = localStorage.getItem("accessToken");
      const decoded = JSON.parse(atob(token!.split(".")[1]));
      const role = decoded.role || "student";

      const basePath =
        role === "admin" || role === "superadmin" || role === "instructor"
          ? "/admin"
          : "/student";

      const api = axiosByRole(role, token!);
      const res = await api.get(
        `/performance/student/${studentId}/process/${processId}`
      );

      setAttemptsData(res.data || []);
    } catch (err) {
      console.error("Error fetching attempts:", err);
      toast({
        title: "Error loading attempts",
        description: "Could not fetch detailed performance data.",
        variant: "destructive",
      });
    } finally {
      setLoadingPerformance(false);
    }
  };

  // Add these states near your other useState declarations (top of component)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Compute these before return (below attemptsData state)
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentAttempts = filteredAttempts.slice(startIdx, endIdx);

  const collapseItems: CollapseProps["items"] = currentAttempts.map((a) => ({
    key: a._id,
    label: `Attempt #${a.attemptNumber} — ${new Date(a.createdAt).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase()} — ${new Date(a.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })}`,
    children: (
      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
        {Object.entries(a.performanceData || {}).map(([k, v]) => (
          <div key={k} className="flex justify-between border p-1 rounded bg-white">
            <span>{k}</span>
            <span className="font-medium text-gray-800">{v}</span>
          </div>
        ))}
      </div>
    ),
  }));




  useEffect(() => {
    if (courseId) fetchStudents();
  }, [courseId]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentPerformanceSummary(selectedStudent.id);
    }
  }, [selectedTopic, selectedType]);

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="p-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Course: {courseTitle}</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                fetchAllStudents();
                setOpen(true);
              }}
            >
              Add Student
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Select Students to Enroll</DialogTitle>
            </DialogHeader>
            <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
              {allStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.email}</p>
                  </div>
                  <Checkbox
                    checked={selectedStudents.includes(s.id)}
                    onCheckedChange={(checked) => {
                      setSelectedStudents((prev) =>
                        checked
                          ? [...prev, s.id]
                          : prev.filter((id) => id !== s.id)
                      );
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmEnroll}>Confirm</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- Student Table --- */}
      <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Sr.No.</th>
            <th className="px-4 py-2 text-left">First Name</th>
            <th className="px-4 py-2 text-left">Last Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Details</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s, index) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{s.firstName}</td>
                <td className="px-4 py-2">{s.lastName}</td>
                <td className="px-4 py-2">{s.email}</td>
                <td className="px-4 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setSelectedStudent(s);
                      setLoadingPerformance(true);
                      await fetchTopicsAndTypes();
                      await fetchStudentPerformanceSummary(s.id);
                      setDetailsOpen(true);
                    }}
                  >
                    View
                  </Button>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                No students enrolled yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- Process Summary Dialog --- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-semibold text-center sm:text-left">
              {selectedStudent
                ? `Test's of ${selectedStudent.firstName} ${selectedStudent.lastName}`
                : "Student Performance"}
            </DialogTitle>
          </DialogHeader>

          {loadingPerformance ? (
            <p className="text-center text-sm text-gray-500 mt-3">Loading performance summary...</p>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5 gap-3 mb-4">
                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700">Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="">All Topics</option>
                    {topics.map((t: any) => (
                      <option key={t._id} value={t._id} className="hover:bg-blue-50 cursor-pointer" >
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="">All Types</option>
                    {types.map((ty: any) => (
                      <option key={ty._id} value={ty._id}>
                        {ty.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              {performanceSummary.length > 0 ? (
                <table className="min-w-full border border-gray-200 rounded-lg mt-2 text-sm sm:text-base">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Sr.No.</th>
                      <th className="px-4 py-2 text-left">Topic</th>
                      <th className="px-4 py-2 text-left">Process Name</th>
                      <th className="px-4 py-2 text-left">Total Attempts</th>
                      <th className="px-4 py-2 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceSummary.map((p, i) => (
                      <tr key={p.processId} className="border-t">
                        <td className="px-4 py-2">{i + 1}</td>
                        <td className="px-4 py-2">{p.topicName}</td>
                        <td className="px-4 py-2">{p.processName}</td>
                        <td className="px-4 py-2">{p.totalAttempts}</td>
                        <td className="px-4 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProcess(p.processId);
                              setAttemptsOpen(true);
                              fetchAttemptsByProcess(selectedStudent!.id, p.processId);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-sm sm:text-base mt-4 text-center">No process data available.</p>
              )}
            </>
          )}

        </DialogContent>
      </Dialog>

      {/* --- Attempts Dialog --- */}
      <Dialog open={attemptsOpen} onOpenChange={setAttemptsOpen}>
        <DialogContent className="w-[95vw] sm:max-w-6xl h-[80vh] flex flex-col p-4 sm:p-6 rounded-lg overflow-hidden">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-6">
              <h3 className="text-sm sm:text-base text-gray-600">
                Student:{" "}
                <span className="font-semibold text-gray-800">
                  {selectedStudent
                    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                    : ""}
                </span>
              </h3>

              <h3 className="text-sm sm:text-base text-gray-600">
                Process:{" "}
                <span className="font-semibold text-gray-800">
                  {performanceSummary.find((p) => p.processId === selectedProcess)
                    ?.processName || "Attempts"}
                </span>
              </h3>

              <h3 className="text-base text-gray-600">
                Course:{" "}
                <span className="font-semibold text-gray-800">{courseTitle || ""}</span>
              </h3>
            </div>

            {/* Compact calendar icon with popover */}
            <Popover
              content={
                <div
                  className="border rounded-lg shadow-sm p-2 bg-white"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Calendar
                    fullscreen={false}
                    value={selectedDate}
                    onSelect={(value) => {
                      setSelectedDate(value);
                      setCalendarOpen(false);
                      setCurrentPage(1);
                    }}
                    style={{ width: 300, height: 320 }}
                  />
                </div>
              }
              trigger="click"
              open={calendarOpen}
              onOpenChange={(open) => setCalendarOpen(open)}
              placement="bottomRight"
              getPopupContainer={(triggerNode) => triggerNode.parentElement!}
            >
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <CalendarOutlined className="text-gray-600 text-4xl" />
              </Button>

            </Popover>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-2">
            {loadingPerformance ? (
              <p className="text-sm text-gray-500 mt-2 text-center">Loading...</p>
            ) : filteredAttempts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-base text-gray-500 font-medium">
                  No Record Found
                </p>
              </div>
            ) : (
              <>
                <Collapse
                  items={collapseItems}
                  accordion
                  className="bg-white rounded-md shadow-sm"
                />
                <div className="flex justify-center mt-4">
                  <Pagination
                    current={currentPage}
                    pageSize={itemsPerPage}
                    total={filteredAttempts.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                  />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
