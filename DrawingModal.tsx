import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Eraser, PenTool, Circle } from 'lucide-react';

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

const COLORS = [
  '#1e293b', 
  '#ef4444', 
  '#f97316', 
  '#f59e0b', 
  '#10b981', 
  '#3b82f6', 
  '#8b5cf6', 
  '#ec4899', 
];

const tapSpring = { scale: 0.92 };

const DrawingModal: React.FC<DrawingModalProps> = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    
    ctx.strokeStyle = mode === 'erase' ? '#ffffff' : color;
    ctx.lineWidth = mode === 'erase' ? 24 : lineWidth;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[32px] w-full max-w-lg h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <motion.button whileTap={tapSpring} onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={24} />
          </motion.button>
          <span className="font-bold text-slate-800">New Sketch</span>
          <motion.button whileTap={tapSpring} onClick={handleSave} className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg shadow-primary-600/20">
            <Check size={24} />
          </motion.button>
        </div>

        <div className="flex-1 relative bg-white touch-none cursor-crosshair">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
           
           <div className="flex items-center gap-3 px-2">
              <Circle size={8} fill="currentColor" className="text-slate-400" />
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={lineWidth} 
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <Circle size={16} fill="currentColor" className="text-slate-400" />
           </div>

           <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-2">
              <motion.button
                 whileTap={tapSpring}
                 onClick={() => setMode(mode === 'erase' ? 'draw' : 'erase')}
                 className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                    mode === 'erase' ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'
                 }`}
                 title="Eraser"
              >
                 <Eraser size={20} />
              </motion.button>
              
              <div className="w-[1px] h-8 bg-slate-300 mx-2" />

              <div className="flex items-center gap-2">
                {COLORS.map(c => (
                  <motion.button
                    key={c}
                    whileTap={tapSpring}
                    onClick={() => { setColor(c); setMode('draw'); }}
                    className={`relative w-9 h-9 rounded-full transition-all ${
                       color === c && mode === 'draw' ? 'scale-110 ring-2 ring-slate-800 ring-offset-2' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                     {color === c && mode === 'draw' && (
                        <motion.div 
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center text-white"
                        >
                           <Check size={14} strokeWidth={3} />
                        </motion.div>
                     )}
                  </motion.button>
                ))}
              </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DrawingModal;