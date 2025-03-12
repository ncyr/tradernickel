import { useState } from 'react';

interface ChartControlsProps {
  interval: string;
  onIntervalChange: (interval: string) => void;
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

const intervals = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '30m', value: '30' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
];

export function ChartControls({
  interval,
  onIntervalChange,
  symbol,
  onSymbolChange,
}: ChartControlsProps) {
  const [symbolInput, setSymbolInput] = useState(symbol);

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSymbolChange(symbolInput.toUpperCase());
  };

  return (
    <div className="flex items-center gap-4">
      <form onSubmit={handleSymbolSubmit} className="flex items-center">
        <input
          type="text"
          value={symbolInput}
          onChange={(e) => setSymbolInput(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          placeholder="Enter symbol..."
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Go
        </button>
      </form>
      
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {intervals.map((int) => (
          <button
            key={int.value}
            onClick={() => onIntervalChange(int.value)}
            className={`px-3 py-1 rounded-md transition-colors ${
              interval === int.value
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {int.label}
          </button>
        ))}
      </div>
    </div>
  );
} 