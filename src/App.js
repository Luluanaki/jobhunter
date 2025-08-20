import React from 'react';
import './index.css';
import { useRef, useState, useEffect } from 'react';
import { HeaderRow } from './components/HeaderRow';
import InputForm  from './components/InputForm';
import { gridTemplateStyle, editBoxStyle, buttonStyle, outerBorderStyle, columnConfig, rowStyle, gridMinWidth, mergedInputStyle, buttonHoverStyle, disabledStyle } from './styles/styles';
import { JobSorter } from './utils/sortJobs';
import { getTodayLocalISO } from './utils/dateUtils';
import { motion } from 'framer-motion';
import { shellVariants, containerVariants, cellVariants, makeContainerVariants, makeCellVariants } from './utils/animations';

function App() 
{
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [authReady, setAuthReady] = useState(false); 
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState('');
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [lastEditedId, setLastEditedId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCancel, setHoveredCancel] = useState(false);
  const [hoveredDeleteConfirm, setHoveredDeleteConfirm] = useState(false);
  const [hoveredDelete, setHoveredDelete] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredEditIndex, setHoveredEditIndex] = useState(null);
  const [flashingId, setFlashingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  
  
  
  const hasAnimatedOnceRef = useRef(false);
  const listRef = useRef(null);
  const isAuthed = !!userId;
  const shouldStagger = isAuthed && !hasAnimatedOnceRef.current;
  const editedRowRef = useRef(null);
  const formRef = useRef(null);
  const sortedJobs = JobSorter(sortConfig, jobs || []);
  const flashTimeoutRef = useRef(null);
  const skipEditedScrollOnceRef = useRef(false);
  const rowRefs = useRef(new Map());

  // after the first reveal with jobs, mark the animation as done
  useEffect(() => {
    if (shouldStagger && sortedJobs.length > 0) {
      // mark after paint so the first render uses stagger
      const id = requestAnimationFrame(() => {
        hasAnimatedOnceRef.current = true;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [shouldStagger, sortedJobs.length]);

  useEffect(() => {
    // on login (userId truthy) or logout (userId empty) reset the flag
    hasAnimatedOnceRef.current = false;
  }, [userId]);

  useEffect(() => {
    if (isAuthed && jobs.length > 0 && !hasAnimatedOnceRef.current) {
      // After the first paint with jobs, mark as done so future adds don't stagger
      // Let this effect run right after the first render that showed items
      hasAnimatedOnceRef.current = true;
    }
  }, [isAuthed, jobs.length]);


  useEffect(() => {
    if (shouldStagger && sortedJobs.length > 0) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [shouldStagger, sortedJobs.length]);
  
  


  useEffect(() => {
    if (isAuthed) {
      setDate(prev => prev || getTodayLocalISO());
    } else {
      setDate(''); 
    }
  }, [isAuthed]);


  useEffect(() => {
    if (!userId) { setJobs([]); return; }
  
    let cancelled = false;
  
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/jobs?userId=${userId}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!cancelled) setJobs(data); 
      } catch (err) {
        if (!cancelled) console.error('Error fetching jobs:', err);
      }
    })();
  
    return () => { cancelled = true; };
  }, [userId]);
  

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
        setJobs([]);
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



  function resetFormFields() {
    setCompany('');
    setTitle('');
    setLocation('');
    setDate('');   
    setSource('');
    setUrl('');
  }


  async function handleLogin(e) {
    e.preventDefault();
    if (!loginInput.trim() || !passwordInput.trim()) return;
  
    try {
      setLoginLoading(true);
      setLoginError('');
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginInput.trim(),
          password: passwordInput,   
        }),
      });
  
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
  
      const data = await response.json();
      setUserId(data._id);
      setUsername(data.username);
      localStorage.setItem('userId', data._id);
  
      // clear inputs on success
      setLoginInput('');
      setPasswordInput('');
  
      // reset form + editing states (same as you had)
      setCompany('');
      setTitle('');
      setLocation('');
      setDate(getTodayLocalISO()); 
      setSource('');
      setUrl('');
      setIsEditing(false);
      setEditingIndex(null);
      setJobToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Login failed:', err);
      setLoginError('Invalid username or password.');
    } finally {
      setLoginLoading(false);
    }
  }
  


  async function handleRegister() {
    if (!regUsername.trim() || !regPassword.trim()) {
      setRegError('Username and password are required.');
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }
  
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000); // 10s safety timeout
  
    try {
      setRegLoading(true);
      setRegError('');
  
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername.trim(), password: regPassword }),
        signal: controller.signal,
      });
      clearTimeout(id);
  
      let body = {};
      try { body = await res.json(); } catch (e) { /* ignore non-JSON */ }
  
      if (!res.ok) {
        throw new Error(body.error || `HTTP ${res.status}`);
      }
  
      // Auto-login
      setUserId(body._id);
      setUsername(body.username);
      localStorage.setItem('userId', body._id);
  
      setShowRegister(false);
      setRegUsername(''); setRegPassword(''); setRegConfirm('');
  
      // Reset form like on login
      setCompany(''); setTitle(''); setLocation('');
      setDate(getTodayLocalISO()); setSource(''); setUrl('');
      setIsEditing(false); setEditingIndex(null);
      setJobToDelete(null); setShowDeleteModal(false);
    } catch (err) {
      console.error('Register failed:', err);
      if (err.name === 'AbortError') {
        setRegError('Server took too long to respond. Try again.');
      } else {
        setRegError(
          String(err.message || '').toLowerCase().includes('already')
            ? 'Username is already taken.'
            : 'Could not create account. Check the server and try again.'
        );
      }
    } finally {
      setRegLoading(false);
    }
  }
  
  


  async function handleSubmit(e) {
    e.preventDefault();
  
    if (!userId) {
      setShowLoginPrompt(true);
      return;
    }
  
    // build finalDate -> formattedDate
    const finalDate = date
      ? (() => {
          const [year, month, day] = date.split('-');
          return new Date(Number(year), Number(month) - 1, Number(day));
        })()
      : new Date();
  
    const formattedDate = finalDate.toLocaleDateString('en-US', {
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
  
    // EDIT MODE
    if (editingIndex !== null) {
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
  
        // update list
        setJobs(prev => prev.map(j => (j._id === jobId ? updatedJob : j)));
  
        // flash highlight
        setLastEditedId(jobId);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        setFlashingId(jobId);
        flashTimeoutRef.current = setTimeout(() => {
          setFlashingId(null);
          flashTimeoutRef.current = null;
        }, 5000);
  
        // ✅ scroll to the edited row (CENTER). Do this after DOM updates.
        requestAnimationFrame(() => {
          const el = rowRefs.current.get(jobId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      } catch (err) {
        console.error('Failed to update job:', err);
      }
  
      setEditingIndex(null);
      resetFormFields();
      return;
    }
  
    // ADD MODE
    try {
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) {
        console.error('Failed to add job:', response.statusText);
        return;
      }

      const savedJob = await response.json();
      const newId = savedJob._id;

      // Add to jobs
      setJobs(prev => [...prev, savedJob]);

      // Flash & highlight logic
      setLastEditedId(newId);
      if (!flashTimeoutRef.current) {
        setFlashingId(newId);
        flashTimeoutRef.current = setTimeout(() => {
          setFlashingId(null);
          flashTimeoutRef.current = null;
        }, 5000);
      }

      // ✅ Scroll to the new row after re-render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = rowRefs.current.get(newId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      });

    } catch (err) {
      console.error('Failed to add job to backend:', err);
    }

    // Reset form
    setCompany('');
    setTitle('');
    setLocation('');
    setDate(getTodayLocalISO());
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
            <form
            onSubmit={handleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              marginTop: '10px',
              marginBottom: '0px',
              flexWrap: 'wrap', // ensures buttons don't disappear off-canvas
            }}
          >
            <input
              type="text"
              placeholder="Enter username"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              style={mergedInputStyle(focusedIndex === 6)}
              onFocus={() => setFocusedIndex(6)}
              onBlur={() => setFocusedIndex(null)}
            />

            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={mergedInputStyle(focusedIndex === 7)}
              onFocus={() => setFocusedIndex(7)}
              onBlur={() => setFocusedIndex(null)}
            />

            <button
              type="submit"                     // <-- use the form submit handler
              disabled={loginLoading}
              style={{ ...buttonStyle }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c21a1a')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgb(141, 0, 0)')}
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"                     // <-- show this while logged out
              onClick={() => {
                setRegUsername(loginInput);     // optional prefill
                setShowRegister(true);
              }}
              style={{
                ...buttonStyle,
                backgroundColor: '#333',
                borderColor: '#555',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a6a6a6ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#333')}
            >
              Create account
            </button>

            {/* Optional small error text */}
            {loginError && (
              <div style={{ width: '100%', color: '#c33', fontSize: 12 }}>{loginError}</div>
            )}
          </form>
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
                  // clear auth info
                  localStorage.removeItem('userId');
                  setUserId('');
                  setUsername('');

                  // reset editing-related state
                  setIsEditing(false);
                  setEditingIndex(null);
                  setJobToDelete(null);
                  setShowDeleteModal(false);

                  //clear the form inputs
                  resetFormFields();

                  //remove all job rows
                  setJobs([]);
                  hasAnimatedOnceRef.current = false;
                }}
                style={{
                  ...buttonStyle,
                  fontSize: '12px',
                  padding: '3px 6px',
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
              <h1 style={{ textAlign: 'center',fontSize: '40px', textShadow: '0px 0px 20px #ffffff', marginBottom: '25px', marginTop: '20px', visibility: isAuthed ? 'visible' : 'hidden'}}><strong>{username}'s Job Hunter</strong></h1> 

              <div style={{  gridColumn: '1 / -1' }}>              
                <div style={ editingIndex !== null ? editBoxStyle : {}}>               
                  <InputForm
                    company={company}
                    setCompany={setCompany}
                    title={title}
                    setTitle={setTitle}
                    location={location}
                    setLocation={setLocation}
                    source={source}
                    setSource={setSource}
                    url={url}
                    setUrl={setUrl}
                    isEditing={editingIndex !== null}
                    editingIndex={editingIndex}
                    handleSubmit={handleSubmit}
                    focusedIndex={focusedIndex}
                    date={date} 
                    setDate={setDate}
                    setFocusedIndex={setFocusedIndex}
                    hovered={hovered}
                    setHovered={setHovered}
                    hoveredDelete={hoveredDelete}
                    setHoveredDelete={setHoveredDelete}
                    jobs={jobs}
                    setJobToDelete={setJobToDelete}
                    setShowDeleteModal={setShowDeleteModal}
                    buttonHoverStyle={buttonHoverStyle}
                    isAuthed={!!userId}
                    setShowLoginPrompt={setShowLoginPrompt}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*JOB LIST*/}
        <div style={{ marginTop: '40px'  }}>
          <div style={{ overflowX: '' }}>
            {isAuthed && (() => {
              return (
                <div
                  style={{ width: '100%', minWidth: gridMinWidth, backgroundColor: '#080808', ...outerBorderStyle }}
                >
                  <HeaderRow
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                    hoveredRow={hoveredRow}
                  />

                  {/* Container for the grid; no internal scrolling so the page scrolls */}
                  <motion.div
                    key={userId}
                    style={{ ...gridTemplateStyle }}
                    variants={makeContainerVariants(shouldStagger, 0.12, 0.05)}  // your existing container variants
                    initial="hidden"
                    animate="show"
                  >
                    {sortedJobs.map((job, index) => {
                      const cells = [
                        index + 1,
                        job.company ?? '',
                        job.title ?? '',
                        job.location ?? '',
                        job.date
                          ? (typeof job.date === 'string'
                              ? job.date
                              : new Date(job.date).toLocaleDateString())
                          : 'Invalid Date',
                        job.source ?? '',
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'rgb(199, 0, 0)' }}
                        >
                          Click
                        </a>,
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
                                setJobs(jobs.map(j => (j._id === updatedJob._id ? updatedJob : j)));
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
                            const originalIndex = jobs.findIndex(j =>
                              j.company === job.company &&
                              j.title === job.title &&
                              j.location === job.location &&
                              j.date === job.date &&
                              j.source === job.source &&
                              j.url === job.url &&
                              j.status === job.status
                            );
                            if (originalIndex !== -1) setEditingIndex(originalIndex);
                          }}
                        >
                          Edit
                        </button>,
                      ];

                      return (
                        <React.Fragment key={job._id}>
                          {cells.map((cell, i) => {
                            const { maxWidth, maxChars } = columnConfig[i];
                            let fontSize = '16px';
                            if (i === 0) fontSize = getDynamicFontSize(String(index + 1).length, maxChars);
                            else if (i === 1) fontSize = getDynamicFontSize((job.company || '').length, maxChars);
                            else if (i === 2) fontSize = getDynamicFontSize((job.title || '').length, maxChars);
                            else if (i === 3) fontSize = getDynamicFontSize((job.location || '').length, maxChars);
                            else if (i === 5) fontSize = getDynamicFontSize((job.source || '').length, maxChars);

                            return (
                              <motion.div
                                key={`${job._id}-${i}`}
                                custom={index}               // row index drives per-row delay
                                variants={makeCellVariants(shouldStagger, 0.05, 0.18)}     // per-cell animation (stagger by row)
                                style={{
                                  ...rowStyle(index, false, i, hoveredRow),
                                  ...(job._id === flashingId
                                    ? {
                                        borderBottom: '5px solid rgba(124, 0, 0, 1)',
                                        borderTop: '5px solid rgba(124, 0, 0, 1)',
                                        backgroundColor: 'rgba(124, 0, 0, 0.08)',
                                      }
                                    : {}),
                                  maxWidth,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize,
                                }}
                                onMouseEnter={() => setHoveredRow(index)}
                                onMouseLeave={() => setHoveredRow(null)}
                                ref={i === 0
                                  ? (el) => {
                                      if (el) rowRefs.current.set(job._id, el);
                                      else rowRefs.current.delete(job._id); // cleanup when row unmounts
                                    }
                                  : null}
                              >
                                {cell === '' ? '\u00A0' : cell}
                              </motion.div>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </motion.div>
                </div>
              );
            })()}
          </div>
        </div>


        {showLoginPrompt && (
          <div 
          onClick={() => setShowLoginPrompt(false)}
            style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000
          }}>
            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{
              backgroundColor: '#1e1e1e',
              padding: '24px',
              borderRadius: '8px',
              minWidth: '300px',
              textAlign: 'center',
              boxShadow: '0 0 15px rgba(199,199,199,0.5)',
            }}>
              <h3 style={{ margin: '0 0 10px', color: '#c33' }}>Please log in</h3>
              <p style={{ margin: 0 }}>You must log in to add jobs.</p>
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  style={{
                    ...buttonStyle,
                    padding: '8px 14px',
                  }}
                  onMouseEnter={(e) => {Object.assign(e.currentTarget.style, buttonHoverStyle);}}                 
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;}}  
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}        

        {showDeleteModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm delete"
            onClick={() => setShowDeleteModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}  
              style={{
                backgroundColor: '#1e1e1e',
                padding: '24px',
                borderRadius: '8px',
                minWidth: '320px',
                maxWidth: '90vw',
                textAlign: 'center',    
                boxShadow: '0 0 15px rgba(199,199,199,0.5)',
              }}
            >
              <h3 style={{ margin: '0 0 10px', color: '#c33' }}>Delete?</h3>
              <p style={{ margin: 0 }}>Are you sure you want to delete this job?</p>

              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowDeleteModal(false);
                  }}
                  style={{
                    ...buttonStyle,
                    padding: '8px 14px',
                    backgroundColor: hoveredDeleteConfirm ? '#c21a1aff' : '#660000',
                    borderColor: 'rgba(124,53,53,1)',
                    minWidth: 110,
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
                    padding: '8px 14px',
                    backgroundColor: hoveredCancel ? '#a6a6a6ff' : '#333333',
                    borderColor: '#555',
                    minWidth: 110,
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

        {showRegister && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create account"
            onClick={() => setShowRegister(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#1e1e1e',
                color: '#fff',
                padding: 24,
                borderRadius: 8,
                boxShadow: '0 0 15px rgba(199,199,199,0.5)',             
                minWidth: 340,
                maxWidth: '90vw',
              }}
            >
              <h3 style={{ margin: '0 0 10px', color: '#c33' }}>Create account</h3>

              <div style={{ display: 'grid', rowGap: 10 }}>
                <input
                  type="text"
                  placeholder="Username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}              
                  style={mergedInputStyle(focusedIndex === 8)}
                  onFocus={() => setFocusedIndex(8)}
                  onBlur={() => setFocusedIndex(null)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={mergedInputStyle(focusedIndex === 9)}
                  onFocus={() => setFocusedIndex(9)}
                  onBlur={() => setFocusedIndex(null)}
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  style={mergedInputStyle(focusedIndex === 10)}
                  onFocus={() => setFocusedIndex(10)}
                  onBlur={() => setFocusedIndex(null)}
                />

                {regError && (
                  <div style={{ color: '#c33', fontSize: 12 }}>{regError}</div>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 6 }}>
                  <button
                    onClick={handleRegister}
                    disabled={regLoading}
                    style={{ ...buttonStyle, minWidth: 120 }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c21a1aff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgb(141, 0, 0)')}
                  >
                    {regLoading ? 'Creating…' : 'Create'}
                  </button>

                  <button
                    onClick={() => setShowRegister(false)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#333',
                      borderColor: '#555',
                      minWidth: 120,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a6a6a6ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        </div>
    </div>
  ); {/*return*/}
}

export default App;
