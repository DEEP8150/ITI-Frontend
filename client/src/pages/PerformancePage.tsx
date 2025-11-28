import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { axiosByRole } from "@/utilis/apiByRole";
import { Collapse, Pagination, Popover } from "antd";
import type { CollapseProps } from "antd";
import { Calendar, theme } from 'antd';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from "dayjs";
import { CalendarOutlined } from "@ant-design/icons";


interface Summary {
    processId: string;
    processName: string;
    totalAttempts: number;
    courseName?: string;
    topicName?: string;
    typeName?: string;
}

interface Attempt {
    _id: string;
    attemptNumber: number;
    performanceData: Record<string, number>;
    createdAt: string;
}

export default function PerformancePage() {
    const [summary, setSummary] = useState<Summary[]>([]);
    const [attemptsData, setAttemptsData] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPerformance, setLoadingPerformance] = useState(false);

    // Filters
    const [courses, setCourses] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedType, setSelectedType] = useState("");

    // Dialog
    const [attemptsOpen, setAttemptsOpen] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
    const [selectedProcessName, setSelectedProcessName] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [calendarOpen, setCalendarOpen] = useState(false);
    // Filtered attempts based on selected date
    const filteredAttempts = attemptsData.filter((a) => {
        const attemptDate = dayjs(a.createdAt).format("YYYY-MM-DD");
        return attemptDate === selectedDate.format("YYYY-MM-DD");
    });



    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { toast } = useToast();
    const token = localStorage.getItem("accessToken");
    if (!token) return <p>Token missing</p>;

    const decoded = JSON.parse(atob(token.split(".")[1]));
    const studentId = decoded?._id;
    const role = decoded?.role;
    const api = axiosByRole(role, token);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) fetchTopicsByCourse(selectedCourse);
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedCourse && selectedTopic)
            fetchTypesByTopic(selectedCourse, selectedTopic);
    }, [selectedCourse, selectedTopic]);

    useEffect(() => {
        fetchSummary();
    }, [selectedCourse, selectedTopic, selectedType]);

    // --- API CALLS ---
    const fetchCourses = async () => {
        try {
            const res = await api.get(`/Courses`);
            setCourses(res.data.courses || []);
        } catch (err: any) {
            toast({
                title: "Error fetching courses",
                description: err.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        }
    };

    const fetchTopicsByCourse = async (courseId: string) => {
        try {
            const res = await api.get(`/courses/${courseId}/topics`);
            setTopics(res.data.topics || []);
        } catch (err: any) {
            toast({
                title: "Error fetching topics",
                description: err.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        }
    };

    const fetchTypesByTopic = async (courseId: string, topicId: string) => {
        try {
            const res = await api.get(`/courses/${courseId}/topics/${topicId}/types`);
            setTypes(res.data.types || []);
        } catch (err: any) {
            toast({
                title: "Error fetching types",
                description: err.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        }
    };

    const fetchSummary = async () => {
        try {
            setLoading(true);
            let url = `/performance/student/${studentId}/summary`;
            const params = [];
            if (selectedCourse) params.push(`courseId=${selectedCourse}`);
            if (selectedTopic) params.push(`topicId=${selectedTopic}`);
            if (selectedType) params.push(`typeId=${selectedType}`);
            if (params.length > 0) url += `?${params.join("&")}`;

            const res = await api.get(url);
            setSummary(res.data || []);
        } catch (err: any) {
            toast({
                title: "Error loading performance data",
                description: err.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAttempts = async (processId: string) => {
        try {
            setLoadingPerformance(true);
            const res = await api.get(
                `/performance/student/${studentId}/process/${processId}`
            );
            setAttemptsData(res.data || []);
        } catch (err: any) {
            toast({
                title: "Failed to load attempts",
                description: err.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setLoadingPerformance(false);
        }
    };

    // Pagination logic
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentAttempts = filteredAttempts.slice(startIdx, endIdx);

    const collapseItems: CollapseProps["items"] = currentAttempts.map((a) => ({
        key: a._id,
        label: `Attempt #${a.attemptNumber} — ${new Date(a.createdAt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).toUpperCase()} -- ${new Date(
            a.createdAt
        ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        })}`,
        children: (
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                {Object.entries(a.performanceData || {}).map(([k, v]) => (
                    <div
                        key={k}
                        className="flex justify-between border p-1 rounded bg-white"
                    >
                        <span>{k}</span>
                        <span className="font-medium text-gray-800">{v}</span>
                    </div>
                ))}
            </div>
        ),
    }));

    // --- UI ---
    if (loading)
        return <p className="p-4 text-center">Loading performance data...</p>;

    return (
        <div className="p-3">
            {/* <h2 className="text-xl font-semibold mb-4">
                Student Performance Summary
            </h2> */}

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <FilterDropdown
                    label="Course"
                    options={courses.map((c) => ({ label: c.title, value: c._id }))}
                    selected={selectedCourse}
                    setSelected={setSelectedCourse}
                    placeholder="All Courses"
                />
                <FilterDropdown
                    label="Topic"
                    options={topics.map((t) => ({ label: t.title, value: t._id }))}
                    selected={selectedTopic}
                    setSelected={setSelectedTopic}
                    placeholder="All Topics"
                />
                <FilterDropdown
                    label="Type"
                    options={types.map((ty) => ({ label: ty.title, value: ty._id }))}
                    selected={selectedType}
                    setSelected={setSelectedType}
                    placeholder="All Types"
                />
            </div>

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sr. No.</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Process</TableHead>
                        <TableHead>Total Attempts</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {summary.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center text-gray-500 py-4"
                            >
                                No performance data found
                            </TableCell>
                        </TableRow>
                    ) : (
                        summary.map((item, index) => (
                            <TableRow key={item.processId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.topicName}</TableCell>
                                <TableCell>{item.processName}</TableCell>
                                <TableCell>{item.totalAttempts}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedProcess(item.processId);
                                            setSelectedProcessName(item.processName);
                                            setCurrentPage(1);
                                            fetchAttempts(item.processId);
                                            setAttemptsOpen(true);
                                        }}
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={attemptsOpen} onOpenChange={setAttemptsOpen}>
                <DialogContent className="max-w-6xl h-[70vh] flex flex-col p-3 rounded-lg">
                    <DialogHeader className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-3 m-3">
                        <div className="flex items-center gap-2">
                            <DialogTitle>
                                Process:{" "}  {selectedProcessName ? `${selectedProcessName}` : "Attempts"}
                                {summary.find((s) => s.processId === selectedProcess) && (
                                    <div className="text-sm text-gray-600 ">
                                        <span className="font-medium">Course:</span>{" "}
                                        {summary.find((s) => s.processId === selectedProcess)?.courseName || "—"}{" "}
                                        | <span className="font-medium">Topic:</span>{" "}
                                        {summary.find((s) => s.processId === selectedProcess)?.topicName || "—"}{" "}
                                        | <span className="font-medium">Type:</span>{" "}
                                        {summary.find((s) => s.processId === selectedProcess)?.typeName || "—"}
                                    </div>
                                )}
                            </DialogTitle>
                            <DialogClose />
                        </div>


                        {/* Compact calendar icon with dropdown */}
                        <Popover
                            content={
                                <div
                                    className="border rounded-lg shadow-sm p-2 bg-white "
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Calendar
                                        fullscreen={false}
                                        value={selectedDate}
                                        onSelect={(value) => {
                                            setSelectedDate(value);
                                            setCalendarOpen(false);
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
                                className="rounded-full hover:bg-gray-100 flex items-center justify-center"
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <CalendarOutlined className="text-gray-600" />
                            </Button>
                        </Popover>
                    </DialogHeader>

                    {/* --- Scrollable content area --- */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                        {loadingPerformance ? (
                            <p className="text-sm text-gray-500 mt-2 text-center">Loading...</p>
                        ) : filteredAttempts.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-sm text-gray-500">No Record Found</p>
                            </div>
                        ) : (
                            <>
                                <Collapse
                                    items={collapseItems}
                                    accordion
                                    className="bg-white rounded-md shadow-sm"
                                />
                                <div className="absolute bottom-0 left-0 right-0 py-3 flex justify-center shadow-inner">
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

function FilterDropdown({
    label,
    options,
    selected,
    setSelected,
    placeholder,
}: {
    label: string;
    options: { label: string; value: string }[];
    selected: string;
    setSelected: (val: string) => void;
    placeholder: string;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="block w-48 appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-150 ease-in-out"
                >
                    <option value="">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 text-xs">
                    ▼
                </div>
            </div>
        </div>
    );
}
