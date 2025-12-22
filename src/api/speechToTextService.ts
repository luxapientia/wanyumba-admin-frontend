import apiClient from './axios.js';

export interface SpeechToTextRequest {
  language?: string;
  model?: string;
}

export interface SpeechToTextResponse {
  text: string;
  language?: string;
  duration?: number;
  model?: string;
}

export const transcribeAudio = async (
  audioFile: File,
  options?: SpeechToTextRequest
): Promise<SpeechToTextResponse> => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  
  if (options?.language) {
    formData.append('language', options.language);
  }
  
  if (options?.model) {
    formData.append('model', options.model);
  }

  const response = await apiClient.post<{ success: boolean; data: SpeechToTextResponse }>(
    '/ai/speech-to-text',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error('Speech-to-text transcription failed');
  }

  return response.data.data;
};

