import React from 'react';
import { cn } from '@/lib/utils';
import { colorPalette } from './colors';
import { ColorInfo, ColorName } from './types';

interface ColorPickerProps {
  selectedColor: ColorName;
  onColorChange: (color: ColorName) => void;
}

export default function ColorPicker({
  selectedColor,
  onColorChange
}: ColorPickerProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-gray-700">Theme Color</label>
        <div className="grid grid-cols-4 gap-3">
          {(Object.entries(colorPalette) as [ColorName, ColorInfo][]).map(
            ([name, { main }]) => (
              <button
                key={name}
                onClick={() => onColorChange(name)}
                className={cn(
                  'h-10 w-10 rounded-full transition-all duration-200 hover:scale-110',
                  selectedColor === name && 'ring-2 ring-blue-500 ring-offset-2'
                )}
                style={{ backgroundColor: main }}
                title={name}
              />
            )
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Selected:{' '}
        <span className="font-medium capitalize text-gray-700">
          {selectedColor}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm text-gray-700">Preview</label>
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: colorPalette[selectedColor].light,
            borderColor: colorPalette[selectedColor].main
          }}
        >
          <div
            className="text-sm"
            style={{ color: colorPalette[selectedColor].main }}
          >
            Sample content with selected color theme
          </div>
        </div>
      </div>
    </div>
  );
}
