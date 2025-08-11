import './index.css';
import { useRef, useState, useEffect } from 'react';
import { HeaderRow } from './components/HeaderRow';
import  InputForm  from './components/InputForm';
import { gridTemplateStyle, editBoxStyle, buttonStyle, outerBorderStyle, columnConfig, rowStyle, gridMinWidth, mergedInputStyle    } from './styles/styles';
import { JobSorter } from './utils/sortJobs';

function App() 
{
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [authReady, setAuthReady] = useState(false); 
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState([]);
  const flashTimeoutRef = useRef(null);
  const [loginFocused, setLoginFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [lastEditedId, setLastEditedId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const buttonHoverStyle = {
    backgroundColor: '#c21a1aff',                           //button hover
  };
  const [hoveredCancel, setHoveredCancel] = useState(false);
  const [hoveredDeleteConfirm, setHoveredDeleteConfirm] = useState(false);
  const [hoveredDelete, setHoveredDelete] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredEditIndex, setHoveredEditIndex] = useState(null);
  const editedRowRef = useRef(null);
  const [flashingId, setFlashingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const sortedJobs = JobSorter(sortConfig, jobs || []);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const formRef = useRef(null);



  useEffect(() => {
    if (!userId) return;
  
    async function fetchJobs() {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs?userId=${userId}`);
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    }
  
    fetchJobs();
  }, [userId]);

  useEffect(() => {
  const storedUserId = localStorage.getItem('userId');
  const isValidObjectId = (v) => /^[a-f\d]{24}$/i.test(v || '');

  if (!isValidObjectId(storedUserId)) {
    // invalid or missing -> show login
    localStorage.removeItem('userId');
    setUserId('');
    setUsername('');
    setAuthReady(true);
    return;
  }

  setUserId(storedUserId);

  let cancelled = false;
  (async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${storedUserId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const user = await res.json();
      if (!cancelled) {
        setUsername(user.username || '');
      }
    } catch (e) {
      console.error('Failed to fetch username:', e);
      if (!cancelled) {
        localStorage.removeItem('userId'); // stale id
        setUserId('');
        setUsername('');
      }
    } finally {
      if (!cancelled) setAuthReady(true);
    }
  })();

  return () => { cancelled = true; };
}, []);



  
  useEffect(() => {
    const existingId = localStorage.getItem('deviceId');
    if (!existingId) {
      const newId = crypto.randomUUID();
      localStorage.setItem('deviceId', newId);
    }
  }, []);

  useEffect(() => {
    if (lastEditedId && editedRowRef.current) {
      editedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [lastEditedId]);

  useEffect(() => {
    if (editingIndex !== null && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingIndex]);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (editingIndex === null || !jobs[editingIndex]) return;
      const job = jobs[editingIndex];
      setCompany(job.company);
      setTitle(job.title);
      setLocation(job.location);
      const parsedDate = new Date(job.date);
      if (!isNaN(parsedDate)) {
        setDate(parsedDate.toISOString().split('T')[0]);
      } else { 
        setDate('');
        }
      setSource(job.source);
      setUrl(job.url);                              
  }, [editingIndex, jobs]);




  async function handleSubmit(e) {
    e.preventDefault();
    
    const [year, month, day] = date.split('-');
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
    const formattedDate = parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  

    const newJob = {
      company,
      title,
      location,
      date: formattedDate,
      source,
      url,
      status: editingIndex !== null ? jobs[editingIndex].status : 'pending',
      userId,
    };
  
    if (editingIndex !== null) {
      // EDIT MODE
      const jobId = jobs[editingIndex]._id;
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newJob),
        });
        
  
        if (!response.ok) {
          console.error('Failed to update job:', response.statusText);
          return;
        }
  
        const updatedJob = await response.json();
  
        // Replace the edited job in state
        setJobs(prevJobs =>
          prevJobs.map(j => (j._id === jobId ? updatedJob : j))
        );
  
        // Flash highlight
        setLastEditedId(jobId);
        if (flashTimeoutRef.current) {
          clearTimeout(flashTimeoutRef.current);
        }
        setFlashingId(jobId);
        flashTimeoutRef.current = setTimeout(() => {
          setFlashingId(null);
          flashTimeoutRef.current = null;
        }, 5000);
      } catch (err) {
        console.error('Failed to update job:', err);
      }
  
      setEditingIndex(null);
    } else {
      // ADD MODE
      try {

        const response = await fetch('http://localhost:5000/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newJob),
        });
        
  
        const savedJob = await response.json();


        setJobs(prevJobs => [...prevJobs, savedJob]);
        setLastEditedId(savedJob._id);
  
        if (!flashTimeoutRef.current) {
          setFlashingId(savedJob._id);
          flashTimeoutRef.current = setTimeout(() => {
            setFlashingId(null);
            flashTimeoutRef.current = null;
          }, 5000);
        }
      } catch (err) {
        console.error('Failed to add job to backend:', err);
      }
    }
  
    // Reset form
    setCompany('');
    setTitle('');
    setLocation('');
    setDate('');
    setSource('');
    setUrl('');
  }
  
  

  async function handleDelete() {
    if (editingIndex === null) return;
  
    const jobToDelete = jobs[editingIndex];
  
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobToDelete._id}`, {
        method: 'DELETE',
      });
      
  
      if (response.ok) {
        const updatedJobs = jobs.filter(job => job._id !== jobToDelete._id);
        setJobs(updatedJobs);
  
        // Reset form
        setCompany('');
        setTitle('');
        setLocation('');
        setDate('');
        setSource('');
        setUrl('');
        setEditingIndex(null);
        setHoveredDelete(false);
        setHoveredDeleteConfirm(false);
      } else {
        console.error('Failed to delete job from backend');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  }
  

  
  function getDynamicFontSize(length, maxChars) {
    if (length <= maxChars) return '16px';
    if (length <= maxChars * 1.15) return '14px';
    if (length <= maxChars * 1.3) return '12px';
    return '10px';
  }


  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh',  alignItems: 'flex-start', fontFamily: "'Inter', sans-serif", backgroundColor: '#080808ff', color: '#ffffffff'  }}>
      <div style={{ width: '100%', maxWidth: '1500px', overflow: 'visible' }}>
        <div> 
          {!userId ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              marginTop: '10px',
              marginBottom: '0px',
            }}>
              <input
                type="text"
                placeholder="Enter username"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                onFocus={() => setLoginFocused(true)}
                onBlur={() => setLoginFocused(false)}
                style={mergedInputStyle(loginFocused)}
                
              />
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:5000/api/users/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ username: loginInput }),
                    });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const data = await response.json();
                    setUserId(data._id);
                    setUsername(data.username);
                    localStorage.setItem('userId', data._id);
                  } catch (err) {
                    console.error('Login failed:', err);
                  }
                }}
                style={{
                  ...buttonStyle
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c21a1a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(141, 0, 0)'}
              >
                Login
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              marginTop: '10px',
              marginBottom: '8px',
              fontSize: '14px',
            }}>
              Logged in as:<strong style={{ color: '#c33' }}>{username}</strong>
              <button
                onClick={() => {
                  localStorage.removeItem('userId');
                  setUserId('');
                  setUsername('');
                }}
                style={{
                  fontSize: '12px',
                  padding: '3px 6px',
                  backgroundColor: 'rgb(141, 0, 0)',
                  color: '#fff',
                  border: '3px solid #9b3232ff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c21a1a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#900'}
              >
                Logout
              </button>
            </div>
          )}
            
        </div> 
        <div style={{ position: 'sticky', left: 0, zIndex: 1000 }}>
            <div style={{ width: gridMinWidth, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', justifyContent: 'center'}}> 
              <div ref={formRef}>               
                <h1 style={{ textAlign: 'center', fontSize: '40px', textShadow: '0px 0px 20px #ffffff', marginBottom: '20px', marginTop: '0px' }}>Lucas Castelein's Job Hunter</h1> 

              <div style={{  gridColumn: '1 / -1' }}>              
                <div style={ editingIndex !== null ? editBoxStyle : {}}>               
                  <InputForm
                    company={company}
                    setCompany={setCompany}
                    title={title}
                    setTitle={setTitle}
                    location={location}
                    setLocation={setLocation}
                    date={date}
                    setDate={setDate}
                    source={source}
                    setSource={setSource}
                    url={url}
                    setUrl={setUrl}
                    isEditing={editingIndex !== null}
                    editingIndex={editingIndex}
                    handleSubmit={handleSubmit}
                    focusedIndex={focusedIndex}
                    setFocusedIndex={setFocusedIndex}
                    hovered={hovered}
                    setHovered={setHovered}
                    hoveredDelete={hoveredDelete}
                    setHoveredDelete={setHoveredDelete}
                    jobs={jobs}
                    setJobToDelete={setJobToDelete}
                    setShowDeleteModal={setShowDeleteModal}
                    buttonHoverStyle={buttonHoverStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px'}}>
          <div style={{ overflowX: '' }}>
            <div style={{ width: '100%', minWidth: gridMinWidth, ...outerBorderStyle }}>
            
            <HeaderRow sortConfig={sortConfig} setSortConfig={setSortConfig} hoveredRow={hoveredRow}/> 
              
              {/* Job Rows */}
              <div style={{ ...gridTemplateStyle }} >

                {sortedJobs.map((job, index) => (   
                    <div key={job._id} 

                      ref={job._id === lastEditedId ? editedRowRef : null} style={{ display: 'contents' }}>
                        {[index + 1, job.company ? job.company : '', job.title ? job.title : '', job.location ? job.location : '', job.date ? (typeof job.date === 'string' ? job.date : new Date(job.date).toLocaleDateString()) : 'Invalid Date', job.source ? job.source : '',
                        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(199, 0, 0)' }}>Click</a>,
                          <select
                            value={job.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;

                              try {
                                const response = await fetch(`http://localhost:5000/api/jobs/${job._id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: newStatus }),
                                });
                                

                                if (response.ok) {
                                  const updatedJob = await response.json();
                                  const updatedJobs = jobs.map(j =>
                                    j._id === updatedJob._id ? updatedJob : j
                                  );
                                  setJobs(updatedJobs);
                                } else {
                                  console.error('Failed to update job status');
                                }
                              } catch (err) {
                                console.error('Error updating job status:', err);
                              }
                            }}
                          >
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                          <option value="interview">Interview</option>
                          <option value="accepted">Accepted</option>
                        </select>,
                        <button
                          style={{ ...buttonStyle, ...(hoveredEditIndex === index ? buttonHoverStyle : {}), padding: '4px 8px', fontSize: '12px' }}
                          onMouseEnter={() => setHoveredEditIndex(index)}
                          onMouseLeave={() => setHoveredEditIndex(null)}
                          onClick={() => {
                            const originalIndex = jobs.findIndex(job =>
                              job.company === sortedJobs[index].company &&
                              job.title === sortedJobs[index].title &&
                              job.location === sortedJobs[index].location &&
                              job.date === sortedJobs[index].date &&
                              job.source === sortedJobs[index].source &&
                              job.url === sortedJobs[index].url &&
                              job.status === sortedJobs[index].status
                            );
                          
                            if (originalIndex !== -1) {
                              setEditingIndex(originalIndex);
                            }
                          }}
                        >
                          Edit
                        </button>
                        ].map((cell, i) => {
                          const { maxWidth, maxChars } = columnConfig[i];
                          let fontSize = '16px';
                          
                          if (i === 0) fontSize = getDynamicFontSize(String(index + 1).length, maxChars);
                          else if (i === 1) fontSize = getDynamicFontSize((job.company || '').length, maxChars);
                          else if (i === 2) fontSize = getDynamicFontSize((job.title || '').length, maxChars);
                          else if (i === 3) fontSize = getDynamicFontSize((job.location || '').length, maxChars);
                          else if (i === 5) fontSize = getDynamicFontSize((job.source || '').length, maxChars);
                          
                          return (
                            <div
                              key={i}
                              style={{
                                ...rowStyle(index, false, i, hoveredRow),
                                ...(job._id === flashingId
                                  ? {
                                      borderBottom: '3px solid rgba(124, 0, 0, 1)',
                                      borderTop: '3px solid rgba(124, 0, 0, 1)',
                                      backgroundColor: 'rgba(124, 0, 0, 0.08)',
                                    }
                                  : {}),
                                maxWidth,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap',
                                fontSize: fontSize,
                              }}
                              onMouseEnter={() => setHoveredRow(index)}
                              onMouseLeave={() => setHoveredRow(null)}
                            >
                              {cell === '' ? '\u00A0' : cell}
                            </div>
                          );                         
                       })}
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div> {/*div for grid*/}

        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{
              backgroundColor: '#1e1e1e',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 0 15px rgba(199, 199, 199, 0.5)',
              color: '#fff',
              minWidth: '300px',
              textAlign: 'center'
            }}>
              <p>Are you sure you want to delete this job?</p>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowDeleteModal(false);
                  }}
                  style={{
                    ...buttonStyle,
                    backgroundColor: hoveredDeleteConfirm ? '#c21a1aff' : '#660000',
                    border: '3px solid rgba(124, 53, 53, 1)',
                  }}
                  onMouseEnter={() => setHoveredDeleteConfirm(true)}
                  onMouseLeave={() => setHoveredDeleteConfirm(false)}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => { setShowDeleteModal(false); setHoveredCancel(false); }}
                  style={{
                    ...buttonStyle,
                    backgroundColor: hoveredCancel ? '#a3a3a3ff' : '#333',
                    border: '3px solid #555',
                  }}
                  onMouseEnter={() => setHoveredCancel(true)}
                  onMouseLeave={() => setHoveredCancel(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
    </div>
  ); {/*return*/}
}

export default App;
