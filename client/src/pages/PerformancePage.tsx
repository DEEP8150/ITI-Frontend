import { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { axiosByRole } from "@/utilis/apiByRole";
import { Collapse, Pagination, Popover } from "antd";
import type { CollapseProps } from "antd";
import { Calendar } from 'antd';
import dayjs from "dayjs";
import { CalendarOutlined } from "@ant-design/icons";

/* ------------------ INTERFACES ------------------ */

interface Summary {
    processId: string;
    processName: string;
    totalAttempts: number;
    courseName?: string;
    topicName?: string;
    typeName?: string;
    positionId: string;
    positionName?: string;
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

    const [courses, setCourses] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [positions, setPositions] = useState<any[]>([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("");

    const [attemptsOpen, setAttemptsOpen] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
    const [selectedProcessName, setSelectedProcessName] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [calendarOpen, setCalendarOpen] = useState(false);

    const filteredAttempts = attemptsData.filter((a) => {
        return dayjs(a.createdAt).format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD");
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { toast } = useToast();

    const token = localStorage.getItem("accessToken");
    if (!token) return <p>Token missing</p>;

    const decoded = JSON.parse(atob(token.split(".")[1]));
    const studentId = decoded?._id;
    const role = decoded?.role;
    const api = axiosByRole(role, token);

    const resetFilters = (...fns: React.Dispatch<any>[]) => {
        fns.forEach((fn) => fn(""));
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (!selectedCourse) {
            setTopics([]);
            resetFilters(setSelectedTopic, setSelectedType, setSelectedPosition);
            return;
        }
        fetchTopicsByCourse(selectedCourse);
        resetFilters(setSelectedTopic, setSelectedType, setSelectedPosition);
    }, [selectedCourse]);

    // Topic → Type
    useEffect(() => {
        if (!selectedTopic) {
            setTypes([]);
            resetFilters(setSelectedType, setSelectedPosition);
            return;
        }
        fetchTypesByTopic(selectedCourse, selectedTopic);
        resetFilters(setSelectedType, setSelectedPosition);
    }, [selectedTopic]);

    // Type → Position
    useEffect(() => {
        if (!selectedType) {
            setPositions([]);
            resetFilters(setSelectedPosition);
            return;
        }
        fetchPositions(selectedCourse, selectedTopic, selectedType);
        resetFilters(setSelectedPosition);
    }, [selectedType]);

    useEffect(() => {
        fetchSummary();
    }, [selectedCourse, selectedTopic, selectedType, selectedPosition]);


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

    const fetchModesByTypes = async (courseId: string, topicId: string) => {
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

    const fetchPositions = async (courseId: string, topicId: string, typeId: string) => {
        try {
            const res = await api.get(`/courses/${courseId}/topics/${topicId}/types/${typeId}/positions`);
            setPositions(res.data.positions || []);
        } catch (err: any) {
            toast({
                title: "Error fetching positions",
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
            if (selectedPosition) params.push(`positionId=${selectedPosition}`);

            if (params.length > 0) url += `?${params.join("&")}`;

            const res = await api.get(url);

            if (!res.data || res.data.length === 0) {
                toast({
                    title: "No Records",
                    description: "No performance data found for selected filters.",
                    variant: "default",
                });
            }

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

    const fetchAttempts = async (positionId: string) => {
        try {
            setLoadingPerformance(true);
            const res = await api.get(`/performance/student/${studentId}/position/${positionId}`);

            if (!res.data || res.data.length === 0) {
                toast({
                    title: "No Records",
                    description: "No attempts found for this position.",
                    variant: "default",
                });
            }

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
    const currentAttempts = filteredAttempts.slice(startIdx, startIdx + itemsPerPage);

    const collapseItems: CollapseProps["items"] = currentAttempts.map((a) => ({
        key: a._id,
        label: `Attempt #${a.attemptNumber} — ${new Date(a.createdAt).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).toUpperCase()} -- ${new Date(a.createdAt).toLocaleDateString("en-GB", {
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

    if (loading)
        return <p className="p-4 text-center">Loading performance data...</p>;

    return (
        <div className="p-3">

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
                <FilterDropdown
                    label="Position"
                    options={positions.map((p) => ({ label: p.title, value: p._id }))}
                    selected={selectedPosition}
                    setSelected={setSelectedPosition}
                    placeholder="All Positions"
                />
            </div>

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sr. No.</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Process</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Total Attempts</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {summary.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                No performance data found
                            </TableCell>
                        </TableRow>
                    ) : (
                        summary.map((item, index) => (
                            <TableRow key={item.processId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.topicName}</TableCell>
                                <TableCell>{item.processName}</TableCell>
                                <TableCell>{item.positionName}</TableCell>
                                <TableCell>{item.totalAttempts}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedProcess(item.processId);
                                            setSelectedProcessName(item.processName);
                                            setCurrentPage(1);
                                            fetchAttempts(item.positionId);
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

            {/* Attempts Dialog */}
            <Dialog open={attemptsOpen} onOpenChange={setAttemptsOpen}>
                <DialogContent className="max-w-6xl h-[70vh] flex flex-col p-3 rounded-lg">
                    <DialogHeader className="flex flex-col md:flex-row justify-between items-center m-3">
                        <div className="flex items-center gap-2">
                            <DialogTitle>
                                Process: {selectedProcessName || "Attempts"}
                            </DialogTitle>
                            <DialogClose />
                        </div>

                        <Popover
                            content={
                                <div className="border rounded-lg shadow-sm p-2 bg-white">
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
                        >
                            <Button variant="outline" size="icon" className="rounded-full">
                                <CalendarOutlined />
                            </Button>
                        </Popover>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                        {loadingPerformance ? (
                            <p className="text-center mt-2">Loading...</p>
                        ) : filteredAttempts.length === 0 ? (
                            <p className="text-center mt-10 text-gray-500">No Record Found</p>
                        ) : (
                            <>
                                <Collapse items={collapseItems} accordion />
                                <div className="absolute bottom-0 left-0 right-0 py-3 flex justify-center">
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

/* ------------------ FILTER DROPDOWN ------------------ */

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
                    className="block w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
                >
                    <option value="">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {/* <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                    ▼
                </div> */}
            </div>
        </div>
    );
}
