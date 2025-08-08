import { gridTemplateStyle, outerBorderColor, rowStyle, sortConfig, } from "./styles";




export function HeaderRow({sortConfig, setSortConfig, hoveredRow}) {
    const headerCells = ['#', 'Company', 'Job Title', 'Location', 'Date', 'Source', 'URL', 'Status', '' ];
    
    return <>
    <div style={{ ...gridTemplateStyle, position: 'sticky', top: 0, zIndex: 10, borderTop: `5px solid ${outerBorderColor}` }}>
    {headerCells.map((text, i) => {
      let key = null;
      switch (i) {
        case 1: key = 'company'; break;
        case 2: key = 'title'; break;
        case 3: key = 'location'; break;
        case 4: key = 'date'; break;
        case 5: key = 'source'; break;
        case 7: key = 'status'; break;
        default: key = null;
      }

      const isSorted = sortConfig.key === key;
      const arrow = isSorted ? (sortConfig.direction === 'asc' ? ' ↓' : ' ↑') : '';

      return (
        <div
          key={i}
          style={{
            ...rowStyle(0, true, i, hoveredRow),
            cursor: key ? 'pointer' : 'default',
            userSelect: 'none'
          }}
          onClick={() => {
            if (!key) return;
            setSortConfig(prev => ({
              key,
              direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
            }));
          }}
        >
          {text}{arrow}
        </div>
      );
    })}
    </div></>
  }