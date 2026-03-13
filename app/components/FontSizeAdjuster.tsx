import React from 'react';
import { Slider } from "@/components/ui/slider";
import { useQuizSettings } from '@/hooks/use-quiz-settings';

export function FontSizeAdjuster() {
  const { settings, updateFontSize } = useQuizSettings();

  return (
    <div>
      <label htmlFor="font-size-slider">Font Size: {settings.fontSize}px</label>
      <Slider
        id="font-size-slider"
        min={12}
        max={24}
        step={1}
        value={[settings.fontSize]}
        onValueChange={(value: number[]) => updateFontSize(value[0])}
      />
    </div>
  );
}