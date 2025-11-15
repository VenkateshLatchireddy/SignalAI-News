import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Settings, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { voiceService } from '../services/voiceService';

const VoiceReader: React.FC = () => {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [currentArticleId, setCurrentArticleId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const { currentLanguage, languages, getLanguageScript, getRegionalContext } = useLanguage();

  useEffect(() => {
    const handleVoiceReading = (e: CustomEvent) => {
      const { text, articleId, isFullArticle } = e.detail;
      
      if (currentArticleId === articleId && isReading) {
        stop();
        return;
      }

      setCurrentText(text);
      setCurrentArticleId(articleId);
      startReading(text);
    };

    window.addEventListener('startVoiceReading' as any, handleVoiceReading);
    
    return () => {
      window.removeEventListener('startVoiceReading' as any, handleVoiceReading);
      stopReading();
    };
  }, [currentArticleId, isReading]);

  const stopReading = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setIsLoading(false);
    document.body.classList.remove('voice-reading-active');
  };

  const getVoiceForLanguage = (languageCode: string): { lang: string; voice: string | null } => {
    const voiceMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'gu': 'gu-IN',
      'mr': 'mr-IN',
      'kn': 'kn-IN',
      'or': 'or-IN',
      'pa': 'pa-IN'
    };
    
    const lang = voiceMap[languageCode] || 'en-IN';
    
    // Try to find a native voice for the language
    const voices = window.speechSynthesis.getVoices();
    const nativeVoice = voices.find(voice => 
      voice.lang.startsWith(languageCode) || voice.lang === lang
    );
    
    return {
      lang,
      voice: nativeVoice?.name || null
    };
  };

  const startReading = async (text: string) => {
    if (isMuted) return;
    
    stopReading();
    setIsLoading(true);
    
    // Add visual indicator for voice reading
    document.body.classList.add('voice-reading-active');

    // Try ElevenLabs first if enabled and available
    if (useElevenLabs && voiceService.isElevenLabsAvailable()) {
      try {
        const audioBuffer = await voiceService.generateSpeech(text, currentLanguage);
        
        if (audioBuffer) {
          const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          
          audio.onloadstart = () => setIsLoading(true);
          audio.oncanplay = () => setIsLoading(false);
          audio.onplay = () => {
            setIsReading(true);
            setIsPaused(false);
            setIsLoading(false);
          };
          audio.onpause = () => setIsPaused(true);
          audio.onended = () => {
            setIsReading(false);
            setIsPaused(false);
            setCurrentAudio(null);
            document.body.classList.remove('voice-reading-active');
            window.dispatchEvent(new CustomEvent('voiceReadingEnded'));
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            console.warn('ElevenLabs audio playback failed, falling back to Web Speech API');
            setCurrentAudio(null);
            URL.revokeObjectURL(audioUrl);
            startWebSpeechReading(text);
          };

          setCurrentAudio(audio);
          audio.play().catch(() => {
            console.warn('Audio play failed, falling back to Web Speech API');
            startWebSpeechReading(text);
          });
          return;
        }
      } catch (error) {
        console.warn('ElevenLabs synthesis failed:', error);
      }
    }

    // Fallback to Web Speech API
    startWebSpeechReading(text);
  };

  const startWebSpeechReading = (text: string) => {
    setIsLoading(false);
    
    const utterance = new SpeechSynthesisUtterance(text);
    const { lang, voice } = getVoiceForLanguage(currentLanguage);
    
    utterance.lang = lang;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Adjust rate based on script complexity
    const script = getLanguageScript(currentLanguage);
    const complexScripts = ['Devanagari', 'Bengali', 'Tamil', 'Telugu', 'Gujarati', 'Kannada', 'Odia', 'Gurmukhi'];
    
    if (complexScripts.includes(script)) {
      utterance.rate = 0.75; // Slower for complex scripts
      utterance.pitch = 1.1; // Slightly higher pitch for clarity
    } else {
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
    }
    
    // Language-specific adjustments
    const languageAdjustments: Record<string, { rate: number; pitch: number }> = {
      'hi': { rate: 0.8, pitch: 1.1 },
      'bn': { rate: 0.75, pitch: 1.0 },
      'ta': { rate: 0.7, pitch: 1.2 },
      'te': { rate: 0.75, pitch: 1.1 },
      'gu': { rate: 0.8, pitch: 1.0 },
      'mr': { rate: 0.8, pitch: 1.1 },
      'kn': { rate: 0.75, pitch: 1.1 },
      'or': { rate: 0.7, pitch: 1.2 },
      'pa': { rate: 0.8, pitch: 1.0 }
    };
    
    if (languageAdjustments[currentLanguage]) {
      const adjustment = languageAdjustments[currentLanguage];
      utterance.rate = adjustment.rate;
      utterance.pitch = adjustment.pitch;
    }
    
    // Set specific voice if available
    if (voice) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      document.body.classList.remove('voice-reading-active');
      window.dispatchEvent(new CustomEvent('voiceReadingEnded'));
    };

    utterance.onerror = () => {
      setIsReading(false);
      setIsPaused(false);
      document.body.classList.remove('voice-reading-active');
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseReading = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPaused(true);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeReading = () => {
    if (currentAudio) {
      currentAudio.play();
      setIsPaused(false);
    } else {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    stopReading();
    setCurrentArticleId('');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && isReading) {
      handleStop();
    }
  };

  if (!isReading && !currentText) return null;

  const currentLanguageName = languages.find(lang => lang.code === currentLanguage)?.nativeName || 'English';
  const script = getLanguageScript(currentLanguage);
  const region = getRegionalContext(currentLanguage);

  return (
    <div className={`fixed bottom-4 right-4 glass-card rounded-3xl shadow-2xl p-6 max-w-sm z-40 script-${script.toLowerCase()} float-animation`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="glass-button p-2 rounded-2xl">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Volume2 className={`w-5 h-5 ${isReading ? 'text-white animate-pulse' : 'text-white'}`} />
            )}
          </div>
          <span className="text-sm font-medium bbc-text">
            {currentLanguage === 'hi' ? 'आवाज़ रीडर' : 
             currentLanguage === 'or' ? 'ଭଏସ୍ ରିଡର୍' :
             currentLanguage === 'bn' ? 'ভয়েস রিডার' :
             currentLanguage === 'ta' ? 'குரல் வாசகர்' :
             currentLanguage === 'te' ? 'వాయిస్ రీడర్' :
             currentLanguage === 'gu' ? 'વૉઇસ રીડર' :
             currentLanguage === 'mr' ? 'व्हॉइस रीडर' :
             currentLanguage === 'kn' ? 'ವಾಯ್ಸ್ ರೀಡರ್' :
             currentLanguage === 'pa' ? 'ਵਾਇਸ ਰੀਡਰ' :
             'Voice Reader'}
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Voice Settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex flex-col items-end">
          {useElevenLabs && voiceService.isElevenLabsAvailable() && (
            <span className="text-xs glass-morphism text-white px-3 py-1 rounded-2xl mb-2">
              <div className="flex items-center mb-1">
                <Zap className="w-3 h-3 text-orange-500 mr-1" />
                <span className="text-xs text-orange-600 font-medium">AI Voice</span>
              </div>
            </span>
          )}
          <span className="text-xs bg-gray-100 bbc-text px-3 py-1 mb-2 border border-gray-200">
            {currentLanguageName}
          </span>
          <span className="text-xs text-white/60">
            {script} • {region}
          </span>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Voice Settings</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useElevenLabs}
                onChange={(e) => setUseElevenLabs(e.target.checked)}
                className="mr-2 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">
                Use AI Voice (ElevenLabs)
                {!voiceService.isElevenLabsAvailable() && (
                  <span className="text-orange-600 ml-1">(API key required)</span>
                )}
              </span>
            </label>
            <div className="text-xs text-gray-500">
              AI voice provides more natural, realistic speech synthesis
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center space-x-3">
        {isLoading && (
          <div className="text-center">
            <div className="text-xs text-orange-600 font-medium">
              {useElevenLabs ? 'Generating AI voice...' : 'Loading...'}
            </div>
          </div>
        )}

        {isReading && !isPaused && (
          <button
            onClick={pauseReading}
            className="glass-button bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-2xl transition-all hover:scale-110"
            title={currentLanguage === 'hi' ? 'रोकें' : 
                   currentLanguage === 'or' ? 'ବିରତି' :
                   currentLanguage === 'bn' ? 'বিরতি' :
                   currentLanguage === 'ta' ? 'இடைநிறுத்தம்' :
                   currentLanguage === 'te' ? 'విరామం' :
                   currentLanguage === 'gu' ? 'વિરામ' :
                   currentLanguage === 'mr' ? 'विराम' :
                   currentLanguage === 'kn' ? 'ವಿರಾಮ' :
                   currentLanguage === 'pa' ? 'ਵਿਰਾਮ' :
                   'Pause'}
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        {isReading && isPaused && (
          <button
            onClick={resumeReading}
            className="glass-button bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-2xl transition-all hover:scale-110"
            title={currentLanguage === 'hi' ? 'जारी रखें' : 
                   currentLanguage === 'or' ? 'ପୁନଃଆରମ୍ଭ' :
                   currentLanguage === 'bn' ? 'পুনরায় শুরু' :
                   currentLanguage === 'ta' ? 'மீண்டும் தொடங்கு' :
                   currentLanguage === 'te' ? 'కొనసాగించు' :
                   currentLanguage === 'gu' ? 'ફરી શરૂ કરો' :
                   currentLanguage === 'mr' ? 'पुन्हा सुरू करा' :
                   currentLanguage === 'kn' ? 'ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ' :
                   currentLanguage === 'pa' ? 'ਮੁੜ ਸ਼ੁਰੂ ਕਰੋ' :
                   'Resume'}
          >
            <Play className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={handleStop}
          className="glass-button bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 rounded-2xl transition-all hover:scale-110"
          title={currentLanguage === 'hi' ? 'बंद करें' : 
                 currentLanguage === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' :
                 currentLanguage === 'bn' ? 'বন্ধ করুন' :
                 currentLanguage === 'ta' ? 'நிறுத்து' :
                 currentLanguage === 'te' ? 'ఆపు' :
                 currentLanguage === 'gu' ? 'બંધ કરો' :
                 currentLanguage === 'mr' ? 'बंद करा' :
                 currentLanguage === 'kn' ? 'ನಿಲ್ಲಿಸಿ' :
                 currentLanguage === 'pa' ? 'ਬੰਦ ਕਰੋ' :
                 'Stop'}
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          onClick={toggleMute}
          className={`glass-button p-3 rounded-2xl transition-all hover:scale-110 ${
            isMuted 
              ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
          }`}
          title={isMuted ? 
                 (currentLanguage === 'hi' ? 'आवाज़ चालू करें' : 
                  currentLanguage === 'or' ? 'ଶବ୍ଦ ଚାଲୁ କରନ୍ତୁ' :
                  currentLanguage === 'bn' ? 'শব্দ চালু করুন' :
                  currentLanguage === 'ta' ? 'ஒலி இயக்கு' :
                  currentLanguage === 'te' ? 'ధ్వని ఆన్ చేయి' :
                  currentLanguage === 'gu' ? 'અવાજ ચાલુ કરો' :
                  currentLanguage === 'mr' ? 'आवाज चालू करा' :
                  currentLanguage === 'kn' ? 'ಧ್ವನಿ ಆನ್ ಮಾಡಿ' :
                  currentLanguage === 'pa' ? 'ਆਵਾਜ਼ ਚਾਲੂ ਕਰੋ' :
                  'Unmute') :
                 (currentLanguage === 'hi' ? 'आवाज़ बंद करें' : 
                  currentLanguage === 'or' ? 'ଶବ୍ଦ ବନ୍ଦ କରନ୍ତୁ' :
                  currentLanguage === 'bn' ? 'শব্দ বন্ধ করুন' :
                  currentLanguage === 'ta' ? 'ஒலி நிறுத்து' :
                  currentLanguage === 'te' ? 'ధ్వని ఆఫ్ చేయి' :
                  currentLanguage === 'gu' ? 'અવાજ બંધ કરો' :
                  currentLanguage === 'mr' ? 'आवाज बंद करा' :
                  currentLanguage === 'kn' ? 'ಧ್ವನಿ ಆಫ್ ಮಾಡಿ' :
                  currentLanguage === 'pa' ? 'ਆਵਾਜ਼ ਬੰਦ ਕਰੋ' :
                  'Mute')}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {(isReading || isLoading) && (
        <div className="mt-3">
          <div className="glass-morphism h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full w-1/3 animate-pulse rounded-full"></div>
          </div>
          <p className="text-xs glass-text mt-2 text-center">
            {isLoading ? (
              useElevenLabs ? 'Generating AI voice...' : 'Loading...'
            ) : (
              currentLanguage === 'hi' ? 'लेख पढ़ा जा रहा है...' : 
             currentLanguage === 'or' ? 'ଲେଖ ପଢ଼ାଯାଉଛି...' :
             currentLanguage === 'bn' ? 'নিবন্ধ পড়া হচ্ছে...' :
             currentLanguage === 'ta' ? 'கட்டுரை படிக்கப்படுகிறது...' :
             currentLanguage === 'te' ? 'వ్యాసం చదవబడుతోంది...' :
             currentLanguage === 'gu' ? 'લેખ વાંચવામાં આવે છે...' :
             currentLanguage === 'mr' ? 'लेख वाचला जात आहे...' :
             currentLanguage === 'kn' ? 'ಲೇಖನ ಓದಲಾಗುತ್ತಿದೆ...' :
             currentLanguage === 'pa' ? 'ਲੇਖ ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ...' :
             'Reading article...'
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceReader;