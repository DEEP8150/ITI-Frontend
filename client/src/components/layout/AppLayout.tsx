import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { ThemeConfigurator } from "@/components/theme-configurator";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "antd";

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

export default function AppLayout({
    children,
    title,
    description,
    action,
}: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [themeConfigOpen, setThemeConfigOpen] = useState(false);
    const location = useLocation();
    const params = useParams();
    const [nameMap, setNameMap] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchNames = async () => {
            const map: { [key: string]: string } = {};
            try {
                if (params.courseId) {
                    const res = await axios.get(`/courses/${params.courseId}`);
                    map.course = res.data?.course?.title || "Course";
                }
                if (params.topicId) {
                    const res = await axios.get(
                        `/courses/${params.courseId}/topics/${params.topicId}`
                    );
                    map.topic = res.data?.topic?.title || "Topic";
                }
                if (params.typeId) {
                    const res = await axios.get(
                        `/courses/${params.courseId}/topics/${params.topicId}/types/${params.typeId}`
                    );
                    map.type = res.data?.type?.title || "Type";
                }
                setNameMap(map);
            } catch (err) {
                console.error("Error fetching breadcrumb names:", err);
            }
        };
        fetchNames();
    }, [location.pathname, params]);

    const breadcrumbItems = [
        { key: "home", title: <Link to="/dashboard">Home</Link> },
        ...(params.courseId
            ? [
                {
                    key: "course",
                    title: <Link to="/courses">{nameMap.course || "Course"}</Link>,
                },
            ]
            : []),
        ...(params.topicId
            ? [
                {
                    key: "topic",
                    title: (
                        <Link to={`/courses/${params.courseId}/topics`}>
                            {nameMap.topic || "Topic"}
                        </Link>
                    ),
                },
            ]
            : []),
        ...(params.typeId
            ? [
                {
                    key: "type",
                    title: (
                        <Link
                            to={`/courses/${params.courseId}/topics/${params.topicId}/types`}
                        >
                            {nameMap.type || "Type"}
                        </Link>
                    ),
                },
            ]
            : []),
    ];

    return (
        <div className="flex h-screen bg-stone-50 grain-texture">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div
                className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-10 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
            >
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <main className="flex-1 overflow-y-auto p-3 lg:p-6 relative z-10 flex flex-col">
                <div className="lg:hidden mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>

                <Card className="flex-1 border border-stone-200 bg-white relative z-20">
                    {title && (
                        <div className="pt-6 px-3 lg:px-6 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-xl font-semibold text-stone-900 mb-1">
                                        {title}
                                    </h1>
                                    {description && (
                                        <p className="text-sm text-stone-600">{description}</p>
                                    )}
                                </div>
                                {action && <div>{action}</div>}
                            </div>

                            {/* Breadcrumb below title */}
                            <div className="mt-0">
                                <Breadcrumb>
                                    {breadcrumbItems.map((item) => (
                                        <Breadcrumb.Item key={item.key}>
                                            {item.title}
                                        </Breadcrumb.Item>
                                    ))}
                                </Breadcrumb>
                            </div>

                            <div className="border-b border-stone-200 mt-4"></div>
                        </div>
                    )}

                    {children}
                </Card>
                <Footer />
            </main>

            <ThemeConfigurator
                isOpen={themeConfigOpen}
                onClose={() => setThemeConfigOpen(false)}
            />
        </div>
    );
}
