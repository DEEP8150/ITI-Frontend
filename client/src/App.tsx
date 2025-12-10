import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";
import { ThemeConfigurator } from "@/components/theme-configurator";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Tables from "@/pages/tables";
import Notifications from "@/pages/notifications";
import Subscriptions from "@/pages/subscriptions";
import Documentation from "@/pages/documentation";
import SignIn from "@/pages/auth/Log-in";
import SignUp from "@/pages/auth/Registeration";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import OtpVerification from "./pages/otpVerication";
import Logout from "./pages/auth/Logout";
import { AuthProvider } from "./pages/auth/AuthContext";
import InstructorsPage from "./pages/Instructors";
import StudentsPage from "./pages/Students";
import CoursesPage from "./pages/course";
import CreateUserPage from "./pages/AddNewUser";
import CourseStudentsPage from "./pages/CourseStudentPage";
import TopicsPage from "./pages/TopicPage";
import TypesPage from "./pages/TypesPage";
import ModesPage from "./pages/ModesPage";
import ProcessesPage from "./pages/ProcessPage";
import PerformancePage from "./pages/PerformancePage";
import { Breadcrumb } from 'antd';
import React from 'react';
import axios from "axios";
import { Link, useLocation,useParams  } from 'react-router-dom';
import StudentDashboard from "./pages/StudentDashboard";
import PositionsPage from "./pages/PositionsPage";

function Layout({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) {
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
          const res = await axios.get(`/courses/${params.courseId}/topics/${params.topicId}`);
          map.topic = res.data?.topic?.title || "Topic";
        }
        if (params.typeId) {
          const res = await axios.get(`/courses/${params.courseId}/topics/${params.topicId}/types/${params.typeId}`);
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
      ? [{ key: "course", title: <Link to="/courses">{nameMap.course || "Course"}</Link> }]
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
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-10 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
              <h1 className="text-xl font-semibold text-stone-900 mb-1">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-stone-600">{description}</p>
              )}

              {/* Breadcrumb below title */}
              <div className="mt-2">
                <Breadcrumb>
                  {breadcrumbItems.map((item) => (
                    <Breadcrumb.Item key={item.key}>{item.title}</Breadcrumb.Item>
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

function Router() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/auth/log-in" replace />} />

      <Route path="/auth/log-in" element={<SignIn />} />
      <Route path="/auth/registration" element={<SignUp />} />
      <Route path="/auth/logout" element={<Logout />} />

      <Route path="/auth/otp-verification" element={<OtpVerification />} />

      <Route path="/dashboard" element={
        <Layout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Layout>
      } />
      <Route path="/profile" element={
        <Layout title="Profile" description="Manage your account settings and personal information">
          <Profile />
        </Layout>
      } />
      <Route path="/instructors" element={
        <Layout title="Instructors" description="List of all instructors">
          <InstructorsPage />
        </Layout>
      } />
      <Route path="/students" element={
        <Layout title="Students" description="List of all students">
          <StudentsPage />
        </Layout>
      } />
      <Route path="/students/:studentId" element={
        <Layout >
          <StudentDashboard />
        </Layout>
      } />
      <Route path="/courses" element={
        <Layout title="Courses" description="List of all courses">
          <CoursesPage />
        </Layout>
      } />
      <Route path="/courses/:courseId/topics" element={
        <Layout title="Topic" description="">
          <TopicsPage />
        </Layout>
      } />
      <Route path="/courses/:courseId/topics/:topicId/types" element={
        <Layout title="Types" description="">
          <TypesPage />
        </Layout>
      } />
      <Route path="/courses/:courseId/topics/:topicId/types/:typeId/modes" element={
        <Layout title="Modes" description="">
          <ModesPage />
        </Layout>
      } />
      <Route path="/courses/:courseId/topics/:topicId/types/:typeId/modes" element={
        <Layout title="Modes" description="">
          <ModesPage />
        </Layout>
      } />
      {/* <Route path="/courses/:courseId/topics/:topicId/types/:typeId/modes/:modeId/processes" element={
        <Layout title="Processes" description="">
          <ProcessesPage />
        </Layout>
      } /> */}

      <Route path="/courses/:courseId/topics/:topicId/details" element={
        <Layout title="Processes" description="">
          <ProcessesPage />
        </Layout>
      } />

      <Route path="/tables" element={
        <Layout title="Tables" description="Browse and manage data across different views">
          <Tables />
        </Layout>
      } />
      {/* <Route path="/notifications" element={
        <Layout title="Notifications" description="Stay updated with your latest alerts and messages">
          <Notifications />
        </Layout>
      } /> */}
      <Route path="/courses/:courseId/students" element={
        <Layout title="course" description="">
          <CourseStudentsPage />
        </Layout>
      } />
      <Route path="/subscriptions" element={
        <Layout title="Subscriptions" description="Manage your billing, plans, and subscription settings">
          <Subscriptions />
        </Layout>
      } />
      <Route path="/performance" element={
        <Layout title="Performace" description="">
          <PerformancePage />
        </Layout>
      } />
      <Route path="/documentation" element={
        <Layout title="Documentation" description="Installation guide, component examples, and project information">
          <Documentation />
        </Layout>
      } />
      <Route path="/positions/:processId" element={
        <Layout title="position" description="get position">
          <PositionsPage />
        </Layout>
      } />


      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HashRouter>
  );
}

export default App;
