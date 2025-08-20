import { useEffect } from 'react';

export const containerVariants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.12,   
      staggerChildren: 0.1, 
    },
  },
};


export const cellVariants = {
  hidden: { opacity: 0, y: 6 },
  show: (rowIndex) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: 'easeOut', delay: rowIndex * 0.05 },
  }),
};

export const shellVariants = {
    show: {      
      transition: { duration: 0.18, ease: 'easeOut', delay: 0.12 }, // line up w/ first row
    },
  };



  
export const rowVariants = {
hidden: { opacity: 0, y: 6 },
show:   { opacity: 1, y: 0, transition: { duration: .18, ease: 'easeOut' } }
};



export const makeContainerVariants = (shouldStagger, baseDelay = 0.12, rowStagger = 0.05) => ({
  hidden: {},
  show: {
    transition: shouldStagger
      ? { delayChildren: baseDelay, staggerChildren: rowStagger, staggerDirection: 1 }
      : {}, // no staggering after first reveal
  },
});

export const makeCellVariants = (shouldStagger, rowStagger = 0.05, cellDuration = 0.18) => ({
  hidden: { opacity: 0, y: 6 },
  // i = rowIndex (we pass it via `custom`)
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: cellDuration,
      ease: 'easeOut',
      delay: shouldStagger ? i * rowStagger : 0, // <- no delay after first reveal
    },
  }),
});

  

export function useAutoScrollToBottom(enabled, deps = []) {
  useEffect(() => {
    if (!enabled) return;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}


