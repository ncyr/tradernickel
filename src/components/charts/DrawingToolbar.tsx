'use client';

import { useState } from 'react';
import { IChartApi } from 'lightweight-charts';
import { 
  Pencil, 
  Minus as Line, 
  Square, 
  Circle, 
  ArrowUpRight, 
  Type, 
  Undo2, 
  Redo2, 
  Eraser,
  X
} from 'lucide-react';

interface DrawingToolbarProps {
  chart: IChartApi | null;
}

type DrawingTool = 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'freeform' | null;

const tools = [
  { id: 'freeform', Icon: Pencil, label: 'Freeform' },
  { id: 'line', Icon: Line, label: 'Line' },
  { id: 'rectangle', Icon: Square, label: 'Rectangle' },
  { id: 'circle', Icon: Circle, label: 'Circle' },
  { id: 'arrow', Icon: ArrowUpRight, label: 'Arrow' },
  { id: 'text', Icon: Type, label: 'Text' },
] as const;

export default function DrawingToolbar({ chart }: DrawingToolbarProps) {
  const [activeTool, setActiveTool] = useState<DrawingTool>(null);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [undoStack, setUndoStack] = useState<any[]>([]);

  const handleToolClick = (toolId: DrawingTool) => {
    if (activeTool === toolId) {
      setActiveTool(null);
    } else {
      setActiveTool(toolId);
    }
  };

  const handleUndo = () => {
    if (drawings.length > 0) {
      const lastDrawing = drawings[drawings.length - 1];
      setUndoStack([...undoStack, lastDrawing]);
      setDrawings(drawings.slice(0, -1));
      // Remove the last drawing from the chart
      if (chart && lastDrawing.id) {
        // Implementation depends on the specific drawing type
      }
    }
  };

  const handleRedo = () => {
    if (undoStack.length > 0) {
      const drawingToRedo = undoStack[undoStack.length - 1];
      setDrawings([...drawings, drawingToRedo]);
      setUndoStack(undoStack.slice(0, -1));
      // Add the drawing back to the chart
      if (chart && drawingToRedo.id) {
        // Implementation depends on the specific drawing type
      }
    }
  };

  const handleClearAll = () => {
    setDrawings([]);
    setUndoStack([]);
    // Remove all drawings from the chart
    if (chart) {
      // Implementation to remove all drawings
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
      <div className="flex flex-col gap-2">
        {tools.map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => handleToolClick(id as DrawingTool)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              activeTool === id ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
            title={label}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
        <button
          onClick={handleUndo}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Undo"
          disabled={drawings.length === 0}
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleRedo}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Redo"
          disabled={undoStack.length === 0}
        >
          <Redo2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleClearAll}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Clear All"
        >
          <Eraser className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 