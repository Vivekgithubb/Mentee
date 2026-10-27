import React from 'react';

export const DotMatrixChart = ({
  totalDots = 36,
  crimsonCount = 10,
  tooltipPrefix = "Student Record"
}) => {
  const darkCount = totalDots - crimsonCount;

  return (
    <div className="grid grid-cols-6 gap-2.5 p-1" aria-label="Dot Matrix Distribution">
      {Array.from({ length: totalDots }).map((_, index) => {
        const isCrimson = index >= darkCount;
        return (
          <div
            key={index}
            className={`w-3.5 h-3.5 rounded-full transition-transform duration-200 hover:scale-125 cursor-pointer ${
              isCrimson
                ? 'bg-brand-red shadow-[0_0_8px_rgba(201,44,46,0.45)]'
                : 'bg-brand-dark'
            }`}
            title={`${tooltipPrefix} #${index + 1}: ${isCrimson ? 'Requires Attention / Milestone' : 'On Track'}`}
          />
        );
      })}
    </div>
  );
};
