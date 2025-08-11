  
  
export function JobSorter(sortConfig, jobs = []) {  
    const sortedJobs =[...jobs];


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
        });
    }

    return sortedJobs;
}