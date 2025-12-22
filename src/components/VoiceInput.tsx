import { forwardRef } from 'react';
import Button from './UI/Button.js';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText.js';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  type?: 'input' | 'textarea';
  rows?: number;
  language?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
}

export const VoiceInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, VoiceInputProps>(
  ({ 
    value, 
    onChange, 
    onBlur, 
    onKeyDown, 
    placeholder, 
    className, 
    id, 
    name,
    type = 'input', 
    rows = 4, 
    language, 
    disabled,
    label,
    error,
    helperText,
    fullWidth,
    required,
  }, ref) => {
    const { isRecording, isTranscribing, toggleRecording } = useSpeechToText({
      language: language || 'auto',
      onTranscriptionComplete: (text) => {
        onChange(text);
      },
    });

    const baseInputClasses = 'w-full rounded-xl border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
    const inputClasses = type === 'textarea' 
      ? `${baseInputClasses} px-4 py-2.5 resize-none`
      : `${baseInputClasses} px-4 py-2.5`;

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''} ${className || ''}`}>
        {label && (
          <label className="text-sm font-semibold text-gray-700 px-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className={`relative w-full rounded-xl border-2 border-gray-200 bg-white focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100 transition-all duration-200 ${
          type === 'textarea' ? 'flex flex-col' : 'flex items-center gap-2'
        } ${error ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-100' : ''}`}>
          {type === 'textarea' ? (
            <>
              <textarea
                ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
                id={id}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                placeholder={placeholder}
                className={`${inputClasses} border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none flex-1`}
                disabled={disabled || isTranscribing}
                rows={rows}
              />
              <div className="flex justify-end pr-2 pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleRecording}
                  disabled={disabled || isTranscribing}
                  className={`h-8 w-8 p-0 ${
                    isRecording ? 'text-red-500 hover:text-red-600 hover:bg-red-50' :
                    isTranscribing ? 'opacity-50 cursor-not-allowed' :
                    'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Start voice input'}
                >
                  {isTranscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <input
                ref={ref as React.ForwardedRef<HTMLInputElement>}
                id={id}
                name={name}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                placeholder={placeholder}
                className={`${inputClasses} border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none flex-1`}
                disabled={disabled || isTranscribing}
                required={required}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                disabled={disabled || isTranscribing}
                className={`h-8 w-8 p-0 flex-shrink-0 mr-1 ${
                  isRecording ? 'text-red-500 hover:text-red-600 hover:bg-red-50' :
                  isTranscribing ? 'opacity-50 cursor-not-allowed' :
                  'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Start voice input'}
              >
                {isTranscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
        
        {(helperText || error) && (
          <p className={`text-xs px-1 ${error ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

VoiceInput.displayName = 'VoiceInput';

