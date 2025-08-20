import { getTodayLocalISO } from '../utils/dateUtils';
import { mergedInputStyle, buttonStyle, disabledStyle } from '../styles/styles';

export default function InputForm( {
  company,
  setCompany,
  title,
  setTitle,
  location,
  setLocation,
  source,
  setSource,
  url,
  setUrl,
  isEditing,
  handleSubmit,
  focusedIndex,
  setFocusedIndex,
  hovered,
  setHovered,
  date,
  setDate,
  hoveredDelete,
  setHoveredDelete,
  editingIndex,
  jobs,
  setJobToDelete,
  setShowDeleteModal,
  buttonHoverStyle,
  isAuthed,
  setShowLoginPrompt
}) {

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
      <input
        maxLength={45}
        value={company}
        onChange={(e) => isAuthed && setCompany(e.target.value)}
        placeholder="Company"
        type="text"
        style={mergedInputStyle(focusedIndex === 0, !isAuthed)}
        onFocus={() => isAuthed && setFocusedIndex(0)}
        onBlur={() => isAuthed && setFocusedIndex(null)}
        onClick={() => {
          if (!isAuthed) {
            setShowLoginPrompt(true);
          }
        }}
      />
      <input
        maxLength={45}
        value={title}
        onChange={(e) => isAuthed && setTitle(e.target.value)}
        placeholder="Job Title"
        type="text"
        style={mergedInputStyle(focusedIndex === 1, !isAuthed)}
        onFocus={() => isAuthed && setFocusedIndex(1)}
        onBlur={() => isAuthed && setFocusedIndex(null)}
        onClick={() => {
          if (!isAuthed) {
            setShowLoginPrompt(true);
          }
        }}
      />
      <input
        maxLength={30}
        value={location}
        onChange={(e) => isAuthed && setLocation(e.target.value)}
        placeholder="Location"
        type="text"
        style={mergedInputStyle(focusedIndex === 2, !isAuthed)}
        onFocus={() => isAuthed && setFocusedIndex(2)}
        onBlur={() => isAuthed && setFocusedIndex(null)}
        onClick={() => {
          if (!isAuthed) {
            setShowLoginPrompt(true);
          }
        }}
      />
      {!isAuthed ? (
        //disabled
        <input
          type="text"
          placeholder="mm/dd/yyyy"   
          readOnly
          style={{...mergedInputStyle(focusedIndex === 3), width: '120px', ...disabledStyle }}
          onClick={() => setShowLoginPrompt(true)}
        />
      ) : (
        //enabled
        <input
          type="date"   
          value={date}                          
          onChange={(e) => setDate(e.target.value)}
          style={{...mergedInputStyle(focusedIndex === 3), width: '120px' }}
          onFocus={() => setFocusedIndex(3)}
          onBlur={() => setFocusedIndex(null)}     
        />
      )}
      <input
        maxLength={30}
        value={source}
        onChange={(e) => isAuthed && setSource(e.target.value)}
        placeholder="Source"
        type="text"
        style={mergedInputStyle(focusedIndex === 4, !isAuthed)}
        onFocus={() => isAuthed && setFocusedIndex(4)}
        onBlur={() => isAuthed && setFocusedIndex(null)}
        onClick={() => {
          if (!isAuthed) {
            setShowLoginPrompt(true);
          }
        }}
      />
      <input
        value={url}
        onChange={(e) => isAuthed && setUrl(e.target.value)}
        placeholder="URL"
        type="text"
        style={mergedInputStyle(focusedIndex === 5, !isAuthed)}
        onFocus={() => isAuthed && setFocusedIndex(5)}
        onBlur={() => isAuthed && setFocusedIndex(null)}
        onClick={() => {
          if (!isAuthed) {
            setShowLoginPrompt(true);
          }
        }}
      />

      <button
        type="submit"
        title={!isAuthed ? 'Please log in to add jobs' : undefined}
        style={{ ...buttonStyle, ...(hovered ? buttonHoverStyle : {}), ...( !isAuthed ? disabledStyle : {} ),}}
        onMouseEnter={() => isAuthed && setHovered(true)}
        onMouseLeave={() => isAuthed && setHovered(false)}
      >
        {isEditing ? 'Confirm' : 'Add Job'}
      </button>

      {isEditing && (
        <button
          type="button"
          onClick={() => {
            setJobToDelete(jobs[editingIndex]);
            setShowDeleteModal(true);
          }}
          style={{
            ...buttonStyle,
            backgroundColor: hoveredDelete ? '#c21a1aff' : '#660000',
            borderColor: 'rgba(124, 53, 53, 1)',
          }}
          onMouseEnter={() => setHoveredDelete(true)}
          onMouseLeave={() => setHoveredDelete(false)}
        >
          Delete
        </button>
      )}
    </form>
  );
}
