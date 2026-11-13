import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Profile from './pages/Profile';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import AttendanceHistory from './pages/teacher/AttendanceHistory';
import ManageStudents from './pages/teacher/ManageStudents';
import ManageSubjects from './pages/teacher/ManageSubjects';
import ManageAcademic from './pages/teacher/ManageAcademic';
import AttendanceReports from './pages/teacher/AttendanceReports';
import ManageFaculty from './pages/teacher/ManageFaculty';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSubjectAttendance from './pages/student/StudentSubjectAttendance';
import StudentCalendar from './pages/student/StudentCalendar';
import AttendanceCalculatorPage from './pages/student/AttendanceCalculatorPage';

// Protected Route wrappers
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If wrong role, redirect to appropriate home
    return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

// Root index redirect
const RootRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Loading system..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'teacher' || user.role === 'admin') {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="mark-attendance" element={<MarkAttendance />} />
            <Route path="history" element={<AttendanceHistory />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="academic" element={<ManageAcademic />} />
            <Route path="reports" element={<AttendanceReports />} />
            <Route path="faculty" element={<ManageFaculty />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="subjects" element={<StudentSubjectAttendance />} />
            <Route path="calendar" element={<StudentCalendar />} />
            <Route path="calculator" element={<AttendanceCalculatorPage />} />
          </Route>

          {/* Shared Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'student', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
