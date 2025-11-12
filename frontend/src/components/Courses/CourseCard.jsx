export default function CourseCard({ course, onEnroll, onDrop, enrolled }) {
  if (!course) {
    return null;
  }

  const availableSeats = course.capacity - (course.enrolled || 0);
  const isFull = availableSeats <= 0;

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '15px', 
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}>
      <div style={{ 
        display: 'inline-block',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '8px'
      }}>
        {course.courseCode}
      </div>
      
      <h4 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '18px',
        fontWeight: '600',
        color: '#333'
      }}>
        {course.title}
      </h4>
      
      <p style={{ 
        margin: '0 0 12px 0', 
        color: '#666', 
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        {course.description}
      </p>
      
      <div style={{ 
        marginTop: '12px', 
        fontSize: '13px', 
        color: '#555',
        borderTop: '1px solid #eee',
        paddingTop: '12px'
      }}>
        <p style={{ margin: '4px 0' }}>
          <strong>Instructor:</strong> {course.instructor}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Credits:</strong> {course.credits}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Schedule:</strong> {course.schedule?.days?.join(', ')} at {course.schedule?.time}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Room:</strong> {course.schedule?.room}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Available Seats:</strong> 
          <span style={{ 
            color: isFull ? '#d32f2f' : '#388e3c',
            fontWeight: '600',
            marginLeft: '5px'
          }}>
            {availableSeats}/{course.capacity}
          </span>
        </p>
      </div>

      {onEnroll && !enrolled && (
        <button 
          onClick={() => onEnroll(course._id)}
          disabled={isFull}
          style={{ 
            marginTop: '15px', 
            padding: '10px 16px',
            width: '100%',
            backgroundColor: isFull ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isFull ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!isFull) e.target.style.backgroundColor = '#45a049';
          }}
          onMouseOut={(e) => {
            if (!isFull) e.target.style.backgroundColor = '#4CAF50';
          }}
        >
          {isFull ? '❌ Course Full' : '✓ Enroll Now'}
        </button>
      )}

      {enrolled && onDrop && (
        <button 
          onClick={() => onDrop(course._id)}
          style={{ 
            marginTop: '15px', 
            padding: '10px 16px',
            width: '100%',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#d32f2f';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f44336';
          }}
        >
          Drop Course
        </button>
      )}
    </div>
  );
}
