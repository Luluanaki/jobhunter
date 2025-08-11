import { mergedInputStyle, buttonStyle,  } from '../styles/styles';

export default function InputForm({
  company,
  setCompany,
  title,
  setTitle,
  location,
  setLocation,
  date,
  setDate,
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
  hoveredDelete,
  setHoveredDelete,
  editingIndex,
  jobs,
  setJobToDelete,
  setShowDeleteModal,
  buttonHoverStyle
}) {

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
      <input
        maxLength={45}
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
        type="text"
        style={mergedInputStyle(focusedIndex === 0)}
        onFocus={() => setFocusedIndex(0)}
        onBlur={() => setFocusedIndex(null)}
      />
      <input
        maxLength={45}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Job Title"
        type="text"
        style={mergedInputStyle(focusedIndex === 1)}
        onFocus={() => setFocusedIndex(1)}
        onBlur={() => setFocusedIndex(null)}
      />
      <input
        maxLength={30}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        type="text"
        style={mergedInputStyle(focusedIndex === 2)}
        onFocus={() => setFocusedIndex(2)}
        onBlur={() => setFocusedIndex(null)}
      />
      <input
        value={date}
        onChange={(e) => setDate(e.target.value)}
        type="date"
        style={mergedInputStyle(focusedIndex === 3)}
        onFocus={() => setFocusedIndex(3)}
        onBlur={() => setFocusedIndex(null)}
      />
      <input
        maxLength={30}
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="Source"
        type="text"
        style={mergedInputStyle(focusedIndex === 4)}
        onFocus={() => setFocusedIndex(4)}
        onBlur={() => setFocusedIndex(null)}
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL"
        type="text"
        style={mergedInputStyle(focusedIndex === 5)}
        onFocus={() => setFocusedIndex(5)}
        onBlur={() => setFocusedIndex(null)}
      />

      <button
        type="submit"
        style={{ ...buttonStyle, ...(hovered ? buttonHoverStyle : {}) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
            border: '3px solid rgba(124, 53, 53, 1)',
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
