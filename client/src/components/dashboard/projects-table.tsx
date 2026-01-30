import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { axiosByRole } from "@/utilis/apiByRole";
import { jwtDecode } from "jwt-decode";

interface Course {
  _id: string;
  title: string;
  completion?: number;
  icon?: string;
  iconColor?: string;
}

interface Topic {
  _id: string;
  title: string;
}

interface Process {
  _id: string;
  title: string;
}

interface DecodedToken {
  role?: string;
  [key: string]: any;
}

export function ProjectsTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [topicsMap, setTopicsMap] = useState<Record<string, Topic[]>>({});
  const [processesMap, setProcessesMap] = useState<Record<string, Process[]>>({});
  const [selectedTopics, setSelectedTopics] = useState<Record<string, string>>({});
  const [selectedProcesses, setSelectedProcesses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  const decoded = jwtDecode<DecodedToken>(token);
  const role = decoded?.role;
  const api = axiosByRole(role!, token);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error("Error fetching courses", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (courseId: string) => {
    if (topicsMap[courseId]) return; // cache
    try {
      const res = await api.get(`/courses/${courseId}/topics`);
      setTopicsMap((prev) => ({ ...prev, [courseId]: res.data.topics || [] }));
    } catch (err) {
      console.error("Error fetching topics", err);
    }
  };

  const fetchProcesses = async (topicId: string) => {
    if (processesMap[topicId]) return;
    try {
      const res = await api.get(`/courses/:courseId/topics/:topicId/types/:typeId/modes/:modeId/processes`);
      setProcessesMap((prev) => ({ ...prev, [topicId]: res.data.processes || [] }));
    } catch (err) {
      console.error("Error fetching processes", err);
    }
  };

  if (loading) return <p className="p-4">Loading courses...</p>;

  return (
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Courses</CardTitle>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 uppercase tracking-wider">
                  Process
                </th>
                <th className="px-6 py-3 text-left text-xs font-normal text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => {
                const selectedTopicId = selectedTopics[course._id] || "";
                const selectedProcessId = selectedProcesses[course._id] || "";
                const topics = topicsMap[course._id] || [];
                const processes = selectedTopicId
                  ? processesMap[selectedTopicId] || []
                  : [];

                return (
                  <tr key={course._id} className="hover:bg-gray-50">
                    {/* Course */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {course.title}
                    </td>

                    {/* Topic Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        value={selectedTopicId}
                        onChange={(e) => {
                          const topicId = e.target.value;
                          setSelectedTopics((prev) => ({
                            ...prev,
                            [course._id]: topicId,
                          }));
                          setSelectedProcesses((prev) => ({
                            ...prev,
                            [course._id]: "",
                          }));
                          fetchProcesses(topicId);
                        }}
                        onFocus={() => fetchTopics(course._id)}
                      >
                        <option value="">Select Topic</option>
                        {topics.map((topic) => (
                          <option key={topic._id} value={topic._id}>
                            {topic.title}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Process Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        value={selectedProcessId}
                        onChange={(e) =>
                          setSelectedProcesses((prev) => ({
                            ...prev,
                            [course._id]: e.target.value,
                          }))
                        }
                        disabled={!selectedTopicId}
                      >
                        <option value="">Select Process</option>
                        {processes.map((proc) => (
                          <option key={proc._id} value={proc._id}>
                            {proc.title}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Completion */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">
                          {course.completion ?? 0}%
                        </span>
                        <Progress value={course.completion ?? 0} className="w-32 h-2" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
