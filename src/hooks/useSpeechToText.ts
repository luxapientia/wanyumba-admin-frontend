import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../api/speechToTextService.js';
import { useToast } from '../contexts/ToastContext.js';

interface UseSpeechToTextOptions {
  language?: string;
  model?: string;
  onTranscriptionComplete?: (text: string) => void;
  onError?: (error: Error) => void;
}

export const useSpeechToText = (options?: UseSpeechToTextOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { success, error: showError } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioChunksRef.current.length === 0) {
          setIsRecording(false);
          return;
        }

        setIsTranscribing(true);
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
          
          const result = await transcribeAudio(audioFile, {
            language: options?.language && options.language !== 'auto' ? options.language : undefined,
            model: options?.model,
          });

          if (options?.onTranscriptionComplete) {
            options.onTranscriptionComplete(result.text);
          }

          success('Audio transcribed successfully', 'Your voice input has been converted to text');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio';
          showError('Transcription failed', errorMessage);
          
          if (options?.onError && error instanceof Error) {
            options.onError(error);
          }
        } finally {
          setIsTranscribing(false);
          setIsRecording(false);
          audioChunksRef.current = [];
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access microphone';
      showError('Microphone access denied', errorMessage);
      
      if (options?.onError && error instanceof Error) {
        options.onError(error);
      }
    }
  }, [options, success, showError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};

