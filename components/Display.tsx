import React from 'react';

interface DisplayProps {
  label: string;
  text: string | number;
}

export const Display: React.FC<DisplayProps> = ({ label, text }) => (
  <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg w-full mb-4 shadow-lg">
    <h3 className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">{label}</h3>
    <p className="text-white text-xl font-mono">{text}</p>
  </div>
);
