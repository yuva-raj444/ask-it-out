'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({
  label,
  hint,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        {...props}
        className={`
          w-full px-4 py-3 rounded-xl border text-gray-900 text-base
          placeholder:text-gray-400
          bg-white
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent
          ${error
            ? 'border-red-300 focus:ring-red-300'
            : 'border-gray-200 hover:border-gray-300'
          }
          ${className}
        `}
      />
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
}

export function Textarea({
  label,
  hint,
  error,
  maxLength,
  currentLength = 0,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {maxLength && (
            <span className="text-xs text-gray-400">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        {...props}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-xl border text-gray-900 text-base resize-none
          placeholder:text-gray-400
          bg-white
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent
          ${error
            ? 'border-red-300 focus:ring-red-300'
            : 'border-gray-200 hover:border-gray-300'
          }
          ${className}
        `}
      />
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
