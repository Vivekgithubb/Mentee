import React from 'react';

export const BarChartWidget = ({ data }) => {
  const defaultData = [
    { label: 'Jan', value: 46, height: '62%' },
    { label: 'Feb', value: 32, height: '44%' },
    { label: 'Mar', value: 48, height: '66%' },
    { label: 'Apr', value: 40, height: '54%' },
    { label: 'May', value: 72, height: '94%', highlight: true },
    { label: 'Jun', value: 44, height: '60%' }
  ];

  const chartData = data || defaultData;

  return (
    <div className="flex items-end justify-between h-28 gap-3 pt-3">
      {chartData.map((item, idx) => (
        <div
          key={idx}
          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
          title={`${item.label}: ${item.value} records`}
        >
          {/* Bar Track */}
          <div className="w-full h-20 flex items-end">
            <div
              style={{ height: item.height }}
              className={`w-full rounded-t-sm transition-all duration-300 ${
                item.highlight
                  ? 'bg-brand-red shadow-[0_4px_12px_rgba(201,44,46,0.35)]'
                  : 'bg-brand-dark group-hover:bg-brand-dark/80'
              }`}
            />
          </div>

          {/* Month / Semester Label */}
          <div className="mt-2 text-center">
            {item.highlight ? (
              <span className="bg-brand-red text-white text-[11px] font-bold px-2 py-0.5 rounded">
                {item.label}
              </span>
            ) : (
              <span className="text-brand-gray text-xs font-medium group-hover:text-brand-dark transition-colors">
                {item.label}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
