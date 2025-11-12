import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import StudentDashboard from './components/Dashboard/StudentDashboard.jsx';
import AdminDashboard from './components/Dashboard/AdminDashboard.jsx';
import EnrolledCourses from './components/Dashboard/EnrolledCourses.jsx';
import CourseList from './components/Courses/CourseList.jsx';
import CourseDetails from './components/Courses/CourseDetails.jsx';
import CourseManagement from './components/Admin/CourseManagement.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ background: '#333', padding: '15px', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Course Registration Portal</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                Dashboard
              </Link>
              
              {/* My Courses - ONLY for students */}
              {user.role === 'student' && (
                <Link to="/my-courses" style={{ color: 'white', textDecoration: 'none' }}>
                  My Courses
                </Link>
              )}
              
              <Link to="/courses" style={{ color: 'white', textDecoration: 'none' }}>
                Browse Courses
              </Link>
              
              {/* Manage Courses - ONLY for admins */}
              {user.role === 'admin' && (
                <Link to="/admin/courses" style={{ color: 'white', textDecoration: 'none' }}>
                  Manage Courses
                </Link>
              )}
              
              <button 
                onClick={logout} 
                style={{ 
                  padding: '8px 16px', 
                  cursor: 'pointer',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Role-based dashboard router
function DashboardRouter() {
  const { user } = useAuth();
  
  // Show admin dashboard for admins
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  // Show student dashboard for students
  return <StudentDashboard />;
}

function AppContent() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard - role-based */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardRouter />
            </PrivateRoute>
          } 
        />
        
        {/* My Courses - students only */}
        <Route 
          path="/my-courses" 
          element={
            <PrivateRoute>
              <EnrolledCourses />
            </PrivateRoute>
          } 
        />
        
        {/* Browse Courses - all users */}
        <Route 
          path="/courses" 
          element={
            <PrivateRoute>
              <CourseList />
            </PrivateRoute>
          } 
        />
        
        {/* Course Details - all users */}
        <Route 
          path="/courses/:id" 
          element={
            <PrivateRoute>
              <CourseDetails />
            </PrivateRoute>
          } 
        />
        
        {/* Manage Courses - admins only */}
        <Route 
          path="/admin/courses" 
          element={
            <PrivateRoute>
              <CourseManagement />
            </PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
