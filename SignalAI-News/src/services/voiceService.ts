interface VoiceConfig {
  voiceId: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

interface ElevenLabsResponse {
  audio: ArrayBuffer;
}

class VoiceService {
  private apiKey: string = '';
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  private fallbackEnabled: boolean = true;

  // Voice configurations for different languages and contexts
  private voiceConfigs: Record<string, VoiceConfig> = {
    'en': {
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - Professional male voice
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.0,
      useSpeakerBoost: true
    },
    'en-female': {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - Professional female voice
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.0,
      useSpeakerBoost: true
    },
    'hi': {
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Using English voice for Hindi (ElevenLabs supports multilingual)
      stability: 0.6,
      similarityBoost: 0.8,
      style: 0.1,
      useSpeakerBoost: true
    }
  };

  constructor() {
    // In production, this would come from environment variables
    // For demo purposes, we'll use fallback to browser speech synthesis
    this.apiKey = import.meta.env.VITE_REACT_APP_ELEVENLABS_API_KEY || '';
  }

  async generateSpeech(text: string, language: string = 'en'): Promise<ArrayBuffer | null> {
    // If no API key, fall back to browser speech synthesis
    if (!this.apiKey) {
      return this.fallbackToWebSpeech(text, language);
    }

    try {
      const voiceConfig = this.getVoiceConfig(language);
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceConfig.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: this.preprocessText(text, language),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarityBoost,
            style: voiceConfig.style,
            use_speaker_boost: voiceConfig.useSpeakerBoost
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.warn('ElevenLabs synthesis failed, falling back to browser speech:', error);
      return this.fallbackToWebSpeech(text, language);
    }
  }

  private getVoiceConfig(language: string): VoiceConfig {
    // Select appropriate voice based on language and user preference
    const baseConfig = this.voiceConfigs[language] || this.voiceConfigs['en'];
    
    // You could add logic here to select male/female voices based on user preference
    return baseConfig;
  }

  private preprocessText(text: string, language: string): string {
    // Clean and optimize text for better speech synthesis
    let processedText = text
      .replace(/\n\n/g, '. ') // Replace double newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Ensure proper spacing after sentences
      .trim();

    // Add language-specific preprocessing
    if (language === 'hi') {
      // Add pauses for better Hindi pronunciation
      processedText = processedText.replace(/।/g, '।'); // Devanagari full stop
    }

    // Limit text length for better performance (ElevenLabs has character limits)
    if (processedText.length > 2500) {
      processedText = processedText.substring(0, 2500) + '...';
    }

    return processedText;
  }

  private async fallbackToWebSpeech(text: string, language: string): Promise<null> {
    // Return null to indicate fallback to existing Web Speech API
    return null;
  }

  async getAvailableVoices(): Promise<Array<{id: string, name: string, language: string}>> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        language: voice.labels?.language || 'en'
      }));
    } catch (error) {
      console.warn('Failed to fetch ElevenLabs voices:', error);
      return [];
    }
  }

  // Method to check if ElevenLabs is available
  isElevenLabsAvailable(): boolean {
    return !!this.apiKey;
  }

  // Method to set API key (for settings page)
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
}

export const voiceService = new VoiceService();
export default VoiceService;