import React from 'react';

interface SliderProps {
  id: string;
  min: number;
  max: number;
  step: number;
  value: number[];
  onValueChange: (value: number[]) => void;
}

export function Slider({ id, min, max, step, value, onValueChange }: SliderProps) {
  return (
    <input
      type="range"
      id={id}
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value, 10)])}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    />
  );
}