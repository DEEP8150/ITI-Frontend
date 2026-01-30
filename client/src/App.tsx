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
import { Link, useLocation, useParams } from 'react-router-dom';
import StudentDashboard from "./pages/StudentDashboard";
import PositionsPage from "./pages/PositionsPage";

import AppLayout from "@/components/layout/AppLayout";

function Router() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/auth/log-in" replace />} />

      <Route path="/auth/log-in" element={<SignIn />} />
      <Route path="/auth/registration" element={<SignUp />} />
      <Route path="/auth/logout" element={<Logout />} />

      <Route path="/auth/otp-verification" element={<OtpVerification />} />

      <Route path="/dashboard" element={
        <AppLayout>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </AppLayout>
      } />
      <Route path="/profile" element={
        <AppLayout title="Profile" description="Manage your account settings and personal information">
          <Profile />
        </AppLayout>
      } />
      <Route path="/instructors" element={<InstructorsPage />} />
      <Route path="/students" element={<StudentsPage />} />
      <Route path="/students/:studentId" element={
        <AppLayout >
          <StudentDashboard />
        </AppLayout>
      } />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:courseId/topics" element={<TopicsPage />} />
      <Route path="/courses/:courseId/topics/:topicId/types" element={
        <AppLayout title="Types" description="">
          <TypesPage />
        </AppLayout>
      } />
      <Route path="/courses/:courseId/topics/:topicId/types/:typeId/modes" element={
        <AppLayout title="Modes" description="">
          <ModesPage />
        </AppLayout>
      } />
      <Route path="/courses/:courseId/topics/:topicId/types/:typeId/modes" element={
        <AppLayout title="Modes" description="">
          <ModesPage />
        </AppLayout>
      } />
      {/* <Route path="/courses/:courseId/topics/:topicId/types/:typeId/modes/:modeId/processes" element={
        <AppLayout title="Processes" description="">
          <ProcessesPage />
        </AppLayout>
      } /> */}

      <Route path="/courses/:courseId/topics/:topicId/details" element={<ProcessesPage />} />

      <Route path="/tables" element={
        <AppLayout title="Tables" description="Browse and manage data across different views">
          <Tables />
        </AppLayout>
      } />
      {/* <Route path="/notifications" element={
        <AppLayout title="Notifications" description="Stay updated with your latest alerts and messages">
          <Notifications />
        </AppLayout>
      } /> */}
      <Route path="/courses/:courseId/students" element={
        <AppLayout title="course" description="">
          <CourseStudentsPage />
        </AppLayout>
      } />
      <Route path="/subscriptions" element={
        <AppLayout title="Subscriptions" description="Manage your billing, plans, and subscription settings">
          <Subscriptions />
        </AppLayout>
      } />
      <Route path="/performance" element={
        <AppLayout title="Performace" description="">
          <PerformancePage />
        </AppLayout>
      } />
      <Route path="/documentation" element={
        <AppLayout title="Documentation" description="Installation guide, component examples, and project information">
          <Documentation />
        </AppLayout>
      } />
      <Route path="/positions/:processId" element={
        <AppLayout title="position" description="get position">
          <PositionsPage />
        </AppLayout>
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
