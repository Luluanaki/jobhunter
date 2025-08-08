export const gridTemplateStyle = {
  display: 'grid',
  gridTemplateColumns: '0.3fr 1.5fr 1.5fr 1fr 1fr 1fr 0.36fr 0.63fr 0.4fr',
  columnGap: '3px',
  rowGap: '3px',
};

export const columnConfig = [
  { maxWidth: '34px',  maxChars: 3 },       // #
  { maxWidth: '265px', maxChars: 28 },      // Company
  { maxWidth: '265px', maxChars: 28 },      // Job Title
  { maxWidth: '169px', maxChars: 18 },      // Location
  { maxWidth: '169px', maxChars: 15 },      // Date
  { maxWidth: '169px', maxChars: 15 },      // Source
  { maxWidth: '46px' },                     // URL (just shows "Click")
  { maxWidth: '97px' },                     // Status dropdown
  { maxWidth: '54px' },                     // Edit button
];

export const inputStyle = {
  backgroundColor: '#1e1e1e',                           //input
  color: '#ffffff',                                     //input font
  border: '1px solid #666',
  padding: '6px 8px',
  fontSize: '14px',
  outline: 'none',
};

export const mergedInputStyle = (isFocused) => ({
  ...inputStyle,
  ...(isFocused ? inputFocusStyle : {}),
});

export const inputFocusStyle = {
  border: '1px solid rgb(199, 0, 0)',                     //input hover
};

export const editBoxStyle = {                                      //Colors for edit area
  padding: '20px',
  border: '3px solid rgba(124, 0, 0, 1)',                 
  backgroundColor: 'rgba(124, 0, 0, 0.08)',
  borderRadius: '4px',
  boxShadow: '0 0 8px rgba(194, 0, 0, 0.75)',
};


export const outerBorderColor = ' rgba(97, 97, 97, 1)';        //outside border
export const innerBorderColor = ' #131313ff';                  //inside border
  
export const outerBorderStyle = {
  borderBottom: `5px solid ${outerBorderColor}`,
  borderLeft: `5px solid ${outerBorderColor}`,
  borderRight: `5px solid ${outerBorderColor}`,
  borderRadius: '4x',
  boxShadow: '0 0 30px rgba(97, 97, 97, 0.9)',
  backgroundColor: innerBorderColor
};

export  const buttonStyle = {
  backgroundColor: 'rgb(141, 0, 0)',                      //button
  color: '#fff',                                            //button font
  border: '3px solid #9b3232ff',
  padding: '6px 12px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

export const rowStyle = (index, isHeader = false, i = null, hoveredRow) => ({
  padding: '4px 12px',
  lineHeight: '40px',
  height: '40px',    
  backgroundColor: isHeader 
  ? '#141414ff'                                          //header row
  : hoveredRow === index
  ? 'rgb(73, 14, 14)'                                    //hover row
  : index % 2 === 0 
  ? '#202020ff'                                          //even row
  : '#1a1a1aff',                                         //odd row
  color: isHeader ? '#ffffffff'                          //header font
  : '#e6e6e6ff',                                         //row font
  fontWeight: (i === 0 || isHeader) ? 'bold' : 'normal',
  fontSize: isHeader ? '22px' : i === 0 ? '18px' : '16px',
  textAlign: ( [0, 6, 7, 8].includes(i) || isHeader) ? 'center' : 'left',
  borderBottom: isHeader ? `0px solid ${innerBorderColor}` : null
});

export   const gridMinWidth = '1500px';