import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner';

const TeacherList = ({ teachers, loading = false, error = null }) => {
  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <LoadingSpinner />
        <p style={{ marginTop: '1rem', color: '#666' }}>Loading teachers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          color: '#dc3545',
          fontSize: '1.1rem',
          marginBottom: '1rem'
        }}>
          Error loading teachers
        </div>
        <p style={{ color: '#666' }}>{error}</p>
      </div>
    );
  }

  if (!teachers || teachers.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>No teachers found</p>
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          Add your first teacher using the form above.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: 0 }}>Teachers ({teachers.length})</h3>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* Desktop Table View */}
        <div style={{ 
          display: 'none',
          '@media (min-width: 768px)': { display: 'block' }
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                <th style={{
                  textAlign: 'left',
                  padding: '0.75rem',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Name
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '0.75rem',
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  Subjects
                </th>
                <th style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  fontWeight: 'bold',
                  color: '#495057',
                  width: '120px'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr 
                  key={teacher._id || index}
                  style={{ 
                    borderBottom: '1px solid #dee2e6',
                    ':hover': { backgroundColor: '#f8f9fa' }
                  }}
                >
                  <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                    {teacher.name}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {teacher.subjects.map((subject, subIndex) => (
                        <span
                          key={subIndex}
                          style={{
                            backgroundColor: '#e9ecef',
                            color: '#495057',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ffc107',
                          color: '#212529',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                        title="Edit teacher"
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                        title="Delete teacher"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div style={{ 
          display: 'block',
          '@media (min-width: 768px)': { display: 'none' }
        }}>
          {teachers.map((teacher, index) => (
            <div
              key={teacher._id || index}
              style={{
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#fff'
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>{teacher.name}</strong>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#666', 
                  marginBottom: '0.25rem' 
                }}>
                  Subjects:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {teacher.subjects.map((subject, subIndex) => (
                    <span
                      key={subIndex}
                      style={{
                        backgroundColor: '#e9ecef',
                        color: '#495057',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#ffc107',
                    color: '#212529',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Edit
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

TeacherList.propTypes = {
  teachers: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    subjects: PropTypes.arrayOf(PropTypes.string).isRequired
  })),
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default TeacherList;