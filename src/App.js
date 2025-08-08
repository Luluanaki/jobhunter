import './index.css';
import { useRef, useState, useEffect } from 'react';
import { HeaderRow } from './components/HeaderRow';
import  InputForm  from './components/InputForm';
import { gridTemplateStyle, editBoxStyle, buttonStyle, outerBorderStyle, columnConfig, rowStyle, gridMinWidth    } from './styles/styles';

function App() 
{
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [loginInput, setLoginInput] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState([]);

  const flashTimeoutRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [lastEditedId, setLastEditedId] = useState(null);

  const [hoveredRow, setHoveredRow] = useState(null);
  const buttonHoverStyle = {
    backgroundColor: '#c21a1aff',                           //button hover
  };

  const [hoveredDelete, setHoveredDelete] = useState(false);

  const [hovered, setHovered] = useState(false);
  const [hoveredEditIndex, setHoveredEditIndex] = useState(null);


  const editedRowRef = useRef(null);
  const [flashingId, setFlashingId] = useState(null);

 

  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const sortedJobs = [...jobs];

  
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
    const existingId = localStorage.getItem('deviceId');
    if (!existingId) {
      const newId = crypto.randomUUID();
      localStorage.setItem('deviceId', newId);
    }
  }, []);



  if (sortConfig.key && sortConfig.direction) {
    sortedJobs.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Handle date
      if (sortConfig.key === 'date') {
        const dateA = new Date(valA);
        const dateB = new Date(valB);
        const isValidA = !isNaN(dateA);
        const isValidB = !isNaN(dateB);
      
        // Prioritize valid dates
        if (!isValidA && isValidB) return 1;
        if (isValidA && !isValidB) return -1;
        if (!isValidA && !isValidB) return 0;
      
        valA = dateA;
        valB = dateB;
      }

      // Handle blank strings for specific fields
      const blankSensitiveFields = ['company', 'title', 'location', 'source'];
      if (blankSensitiveFields.includes(sortConfig.key)) {
        const isBlankA = !valA || valA.trim() === '';
        const isBlankB = !valB || valB.trim() === '';
  
        if (isBlankA && !isBlankB) return 1;
        if (!isBlankA && isBlankB) return -1;
        if (isBlankA && isBlankB) return 0;
      }

      // Handle status custom order
      if (sortConfig.key === 'status') {
        const statusOrder = { pending: 0, interview: 1, rejected: 2, accepted: 3 };
        valA = statusOrder[valA] ?? 999;
        valB = statusOrder[valB] ?? 999;
      }

      const lowerA = String(valA).toLowerCase();
      const lowerB = String(valB).toLowerCase();
      
      if (lowerA < lowerB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (lowerA > lowerB) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // If equal ignoring case, compare originals to give uppercase priority
      if (String(valA) < String(valB)) return sortConfig.direction === 'asc' ? -1 : 1;
      if (String(valA) > String(valB)) return sortConfig.direction === 'asc' ? 1 : -1;
      
      return 0;
    })
  }
  
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

        <div style={{ position: 'sticky', left: 0, zIndex: 1000 }}>
            <div style={{ width: gridMinWidth, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', justifyContent: 'center'}}> 
              <div ref={formRef}>               
                <h1 style={{ textAlign: 'center', textShadow: '0px 0px 20px #ffffff', }}>Lucas Castelein's Job Hunter</h1> 

              <div style={{  gridColumn: '1 / -1' }}>
                <div style={ editingIndex !== null ? editBoxStyle : {}}>

                  {!userId ? (
                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                      <input
                        type="text"
                        placeholder="Enter username"
                        value={loginInput}
                        onChange={(e) => setLoginInput(e.target.value)}
                        style={{ padding: '8px', fontSize: '16px' }}
                      />
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('http://localhost:5000/api/users/login', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ username: loginInput }),
                            });

                            const data = await response.json();
                            setUsername(loginInput);
                            setUserId(data._id);
                            localStorage.setItem('userId', data._id);
                          } catch (err) {
                            console.error('Login failed:', err);
                          }
                        }}
                        style={{ marginLeft: '10px', padding: '8px 16px' }}
                      >
                        Login
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '16px' }}>
                      Logged in as <strong>{username}</strong>{' '}
                      <button onClick={() => {
                        localStorage.removeItem('userId');
                        setUserId('');
                        setUsername('');
                      }} style={{ marginLeft: '10px' }}>Logout</button>
                    </div>
                  )}                 
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
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
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
                    backgroundColor: '#900',
                    border: '3px solid rgba(124, 53, 53, 1)',
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#333',
                    border: '3px solid #555',
                  }}
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
