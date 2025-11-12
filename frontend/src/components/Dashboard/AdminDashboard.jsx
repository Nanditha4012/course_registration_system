import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { courseAPI } from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    avgCapacity: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: courses } = await courseAPI.getAll();
      
      const totalCapacity = courses.reduce((sum, c) => sum + c.capacity, 0);
      const avgCapacity = courses.length > 0 ? Math.round(totalCapacity / courses.length) : 0;

      setStats({
        totalCourses: courses.length,
        activeCourses: courses.filter(c => c.isActive).length,
        totalEnrollments: courses.reduce((sum, c) => sum + (c.enrolled || 0), 0),
        avgCapacity: avgCapacity
      });

      setRecentCourses(courses.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Section - Admin Only */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Admin Dashboard</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Welcome back, {user?.name}! 👋
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Total Courses */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '8px' }}>
            Total Courses
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
            {stats.totalCourses}
          </div>
        </div>

        {/* Active Courses */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)'
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '8px' }}>
            Active Courses
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
            {stats.activeCourses}
          </div>
        </div>

        {/* Total Enrollments */}
        <div style={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '8px' }}>
            Total Enrollments
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
            {stats.totalEnrollments}
          </div>
        </div>

        {/* Average Capacity */}
        <div style={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)'
        }}>
          <div style={{ fontSize: '14px', opacity: '0.9', marginBottom: '8px' }}>
            Avg. Class Size
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
            {stats.avgCapacity}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/admin/courses')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
            }}
          >
            📚 Manage Courses
          </button>
          <button
            onClick={() => navigate('/courses')}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)'
            }}
          >
            👀 View All Courses
          </button>
        </div>
      </div>

      {/* Recent Courses */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Recent Courses</h2>
        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Course Code</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Title</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Department</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Enrolled</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCourses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                    No courses yet. Create your first course!
                  </td>
                </tr>
              ) : (
                recentCourses.map(course => (
                  <tr 
                    key={course._id}
                    style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onClick={() => navigate(`/courses/${course._id}`)}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '15px', fontWeight: '500' }}>{course.courseCode}</td>
                    <td style={{ padding: '15px' }}>{course.title}</td>
                    <td style={{ padding: '15px', color: '#666' }}>{course.department}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      {course.enrolled || 0}/{course.capacity}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        background: course.isActive ? '#e8f5e9' : '#ffebee',
                        color: course.isActive ? '#2e7d32' : '#c62828'
                      }}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
