// src/components/AnimatedJobRows.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated grid of job rows (cell-based animation).
 *
 * Props:
 * - jobs: array
 * - gridTemplateStyle: object (your grid columns template)
 * - makeCells(job, rowIndex): returns array of 8 cell values/elements
 * - cellStyle(job, rowIndex, colIndex): returns inline style for each cell
 * - lastEditedId?: string
 * - editedRowRef?: React ref (used on the first cell of the last-edited row)
 * - baseDelay?: number (default 0.12)
 * - rowStagger?: number (default 0.05)
 * - cellDuration?: number (default 0.18)  // not used here directly, but for consistency w/ App timing
 */
export default function AnimatedJobRows({
  jobs,
  gridTemplateStyle,
  makeCells,
  cellStyle,
  lastEditedId,
  editedRowRef,
  baseDelay = 0.12,
  rowStagger = 0.05,
  cellDuration = 0.18,
}) {
  // simple container variants just to enable initial/animate
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: baseDelay,
        staggerChildren: rowStagger,
        staggerDirection: 1,
      },
    },
  };


  // Per-cell variant, delay passed via `custom`
  const cellVariants = {
    hidden: { opacity: 0, y: 6 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: cellDuration, ease: 'easeOut' },
    },
  };


  return (
    <motion.div
      style={{ ...gridTemplateStyle }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {jobs.map((job, rowIndex) => {
        const cells = makeCells(job, rowIndex);
        const rowKey = job._id;

        return (
          <React.Fragment key={rowKey}>
            {cells.map((cell, colIndex) => (
              <motion.div
                key={`${rowKey}-${colIndex}`}
                variants={cellVariants}
                style={cellStyle(job, rowIndex, colIndex)}
                ref={rowKey === lastEditedId && colIndex === 0 ? editedRowRef : null}
              >
                {cell === '' ? '\u00A0' : cell}
              </motion.div>
            ))}
          </React.Fragment>
        );
      })}
    </motion.div>
  );
}
