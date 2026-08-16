import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GuestOnly, ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardShell, PublicLayout } from "./components/ui";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Materials from "./pages/Materials";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TakeExam from "./pages/student/TakeExam";
import {
  StudentExams,
  StudentMaterials,
  StudentNotifications,
  StudentOverview,
  StudentProfile
} from "./pages/student/StudentPages";
import {
  InstructorClasses,
  InstructorExamDetail,
  InstructorExamForm,
  InstructorExams,
  InstructorMaterials,
  InstructorOverview
} from "./pages/instructor/InstructorPages";
import {
  AdminApprovals,
  AdminBroadcast,
  AdminClasses,
  AdminCurriculum,
  AdminOverview,
  AdminUsers
} from "./pages/admin/AdminPages";

const studentNav = [
  { to: "/student", label: "Overview", end: true },
  { to: "/student/exams", label: "Exams" },
  { to: "/student/materials", label: "Materials" },
  { to: "/student/notifications", label: "Notifications" },
  { to: "/student/profile", label: "Profile" }
];

const instructorNav = [
  { to: "/instructor", label: "Overview", end: true },
  { to: "/instructor/exams", label: "Exams" },
  { to: "/instructor/classes", label: "Classes" },
  { to: "/instructor/materials", label: "Materials" }
];

const adminNav = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/approvals", label: "Exam approvals" },
  { to: "/admin/curriculum", label: "Curriculum" },
  { to: "/admin/classes", label: "Classes" },
  { to: "/admin/broadcast", label: "Broadcast" }
];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="materials" element={<Materials />} />
            <Route element={<GuestOnly />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["Student"]} />}>
            <Route
              path="/student"
              element={
                <DashboardShell title="Student" navItems={studentNav} />
              }
            >
              <Route index element={<StudentOverview />} />
              <Route path="exams" element={<StudentExams />} />
              <Route path="exams/:examId" element={<TakeExam />} />
              <Route path="materials" element={<StudentMaterials />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["Instructor"]} />}>
            <Route
              path="/instructor"
              element={
                <DashboardShell title="Instructor" navItems={instructorNav} />
              }
            >
              <Route index element={<InstructorOverview />} />
              <Route path="exams" element={<InstructorExams />} />
              <Route path="exams/new" element={<InstructorExamForm />} />
              <Route path="exams/:examId" element={<InstructorExamDetail />} />
              <Route path="classes" element={<InstructorClasses />} />
              <Route path="materials" element={<InstructorMaterials />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["Admin"]} />}>
            <Route
              path="/admin"
              element={<DashboardShell title="Admin" navItems={adminNav} />}
            >
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="approvals" element={<AdminApprovals />} />
              <Route path="curriculum" element={<AdminCurriculum />} />
              <Route path="classes" element={<AdminClasses />} />
              <Route path="broadcast" element={<AdminBroadcast />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
