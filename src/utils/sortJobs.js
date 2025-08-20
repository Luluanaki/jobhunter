  
  
export function JobSorter(sortConfig, jobs = []) {
    const sortedJobs = [...jobs];
  
    if (sortConfig.key && sortConfig.direction) {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
  
      sortedJobs.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
  
        // Date handling — compare numerically and return
        if (sortConfig.key === 'date') {
          const dateA = new Date(valA);
          const dateB = new Date(valB);
          const isValidA = !isNaN(dateA);
          const isValidB = !isNaN(dateB);
  
          // Put valid dates before invalid ones
          if (!isValidA && isValidB) return 1;
          if (isValidA && !isValidB) return -1;
          if (!isValidA && !isValidB) return 0;
  
          const tA = dateA.getTime();
          const tB = dateB.getTime();
          if (tA === tB) return 0;
          return tA < tB ? -1 * dir : 1 * dir;
        }
  
        // Blank-first/last rules for certain text fields
        const blankSensitiveFields = ['company', 'title', 'location', 'source'];
        if (blankSensitiveFields.includes(sortConfig.key)) {
          const isBlankA = !valA || String(valA).trim() === '';
          const isBlankB = !valB || String(valB).trim() === '';
          if (isBlankA && !isBlankB) return 1;
          if (!isBlankA && isBlankB) return -1;
          if (isBlankA && isBlankB) return 0;
        }
  
        // Status custom order
        if (sortConfig.key === 'status') {
          const order = { pending: 0, interview: 1, rejected: 2, accepted: 3 };
          const sA = order[valA] ?? 999;
          const sB = order[valB] ?? 999;
          if (sA === sB) return 0;
          return sA < sB ? -1 * dir : 1 * dir;
        }
  
        // Generic string-ish compare (case-insensitive first)
        const aStr = String(valA);
        const bStr = String(valB);
        const aLower = aStr.toLowerCase();
        const bLower = bStr.toLowerCase();
        if (aLower < bLower) return -1 * dir;
        if (aLower > bLower) return 1 * dir;
        if (aStr < bStr) return -1 * dir;
        if (aStr > bStr) return 1 * dir;
        return 0;
      });
    }
  
    return sortedJobs;
  }
  