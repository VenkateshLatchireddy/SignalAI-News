import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Mic, Bot, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNews } from '../context/NewsContext';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  links?: Array<{ text: string; url: string }>;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { translations, currentLanguage } = useLanguage();
  const { searchArticles, getArticlesByCategory } = useNews();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: currentLanguage === 'hi' 
          ? 'नमस्ते! मैं SignalAI News का AI असिस्टेंट हूं। आप किस बारे में जानना चाहते हैं?' 
          : currentLanguage === 'or'
          ? 'ନମସ୍କାର! ମୁଁ SignalAI News ର AI ସହାୟକ। ଆପଣ କଣ ଜାଣିବାକୁ ଚାହୁଁଛନ୍ତି?'
          : 'Hello! I\'m SignalAI News AI assistant. What would you like to know about?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, currentLanguage]);

  const detectIntent = (text: string): { intent: string; entities: any } => {
    const lowerText = text.toLowerCase();
    
    // City detection
    const cities = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'lucknow'];
    const detectedCity = cities.find(city => lowerText.includes(city));
    
    // Category detection
    const categories = ['business', 'sports', 'technology', 'health', 'entertainment', 'politics', 'india', 'world'];
    const detectedCategory = categories.find(cat => lowerText.includes(cat));
    
    // Intent detection
    if (lowerText.includes('breaking') || lowerText.includes('latest') || lowerText.includes('top')) {
      return { intent: 'breaking_news', entities: { category: detectedCategory } };
    }
    
    if (detectedCity) {
      return { intent: 'city_news', entities: { city: detectedCity, category: detectedCategory } };
    }
    
    if (detectedCategory) {
      return { intent: 'category_news', entities: { category: detectedCategory } };
    }
    
    if (lowerText.includes('search') || lowerText.includes('find')) {
      return { intent: 'search', entities: { query: text } };
    }
    
    return { intent: 'general', entities: { query: text } };
  };

  const generateResponse = (intent: string, entities: any): { response: string; links?: Array<{ text: string; url: string }> } => {
    const responses = {
      hi: {
        breaking_news: 'यहाँ आज की ताज़ा खबरें हैं। मैंने आपके लिए सबसे महत्वपूर्ण समाचार एकत्र किए हैं।',
        city_news: `${entities.city ? entities.city : 'शहर'} से संबंधित समाचार यहाँ हैं।`,
        category_news: `${entities.category ? entities.category : 'इस विषय'} की नवीनतम खबरें यहाँ हैं।`,
        general: 'मैं आपकी मदद के लिए यहाँ हूं। आप किसी विशिष्ट विषय या शहर के बारे में पूछ सकते हैं।'
      },
      or: {
        breaking_news: 'ଏଠାରେ ଆଜିର ତାଜା ଖବର ଅଛି। ମୁଁ ଆପଣଙ୍କ ପାଇଁ ମହତ୍ୱପୂର୍ଣ୍ଣ ସମାଚାର ସଂଗ୍ରହ କରିଛି।',
        city_news: `${entities.city ? entities.city : 'ସହର'} ସମ୍ବନ୍ଧୀୟ ସମାଚାର ଏଠାରେ ଅଛି।`,
        category_news: `${entities.category ? entities.category : 'ଏହି ବିଷୟ'} ର ନୂତନ ଖବର ଏଠାରେ ଅଛି।`,
        general: 'ମୁଁ ଆପଣଙ୍କର ସାହାୟ୍ୟ ପାଇଁ ଏଠାରେ ଅଛି। ଆପଣ କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ ବିଷୟ ବା ସହର ବିଷୟରେ ପଚାରି ପାରନ୍ତି।'
      },
      en: {
        breaking_news: 'Here are today\'s breaking news stories. I\'ve curated the most important updates for you.',
        city_news: `Here's the latest news from ${entities.city || 'your requested city'}.`,
        category_news: `Latest ${entities.category || 'news'} updates are here.`,
        general: 'I\'m here to help you find the news you\'re looking for. You can ask about specific topics, cities, or categories.'
      }
    };

    const langResponses = responses[currentLanguage as keyof typeof responses] || responses.en;
    const response = langResponses[intent as keyof typeof langResponses] || langResponses.general;

    const links: Array<{ text: string; url: string }> = [];

    // Generate appropriate links based on intent
    if (intent === 'breaking_news') {
      links.push({ text: 'View Breaking News', url: '/' });
    } else if (intent === 'city_news' && entities.city) {
      links.push({ 
        text: `${entities.city} News`, 
        url: `/news/local?q=${entities.city}%20news&lang=${currentLanguage}&t=${Date.now()}` 
      });
    } else if (intent === 'category_news' && entities.category) {
      links.push({ 
        text: `${entities.category} News`, 
        url: `/category/${entities.category}` 
      });
    }

    return { response, links: links.length > 0 ? links : undefined };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const { intent, entities } = detectIntent(inputText);
    const { response, links } = generateResponse(intent, entities);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      links
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'or' ? 'or-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Voice recognition error');
    };

    recognition.start();
  };

  const quickSuggestions = [
    { text: currentLanguage === 'hi' ? 'दिल्ली की खबरें' : currentLanguage === 'or' ? 'ଦିଲ୍ଲୀ ଖବର' : 'Delhi News', query: 'Delhi news' },
    { text: currentLanguage === 'hi' ? 'ताज़ा खबर' : currentLanguage === 'or' ? 'ତାଜା ଖବର' : 'Breaking News', query: 'latest breaking news' },
    { text: currentLanguage === 'hi' ? 'बिज़नेस' : currentLanguage === 'or' ? 'ବ୍ୟବସାୟ' : 'Business', query: 'business news' },
    { text: currentLanguage === 'hi' ? 'खेल' : currentLanguage === 'or' ? 'ଖେଳ' : 'Sports', query: 'sports news' }
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-red-600 to-red-700 text-white p-5 rounded-2xl shadow-2xl transition-all duration-500 z-50 group hover:scale-110 hover:from-red-700 hover:to-red-800"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </>
        )}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap backdrop-blur-sm">
          {translations.chatWithAI}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 left-6 w-96 h-96 bg-white/95 backdrop-blur-md border border-red-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between border-b border-red-300">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">SignalAI AI</span>
              <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold">LIVE</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-lg text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl p-4 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                    : 'bg-white/80 backdrop-blur-sm shadow-lg border border-red-100'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && <Bot className="w-4 h-4 mt-1 text-red-600" />}
                    {message.type === 'user' && <User className="w-4 h-4 mt-1" />}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      {message.links && (
                        <div className="mt-2 space-y-1">
                          {message.links.map((link, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                navigate(link.url);
                                setIsOpen(false);
                              }}
                              className="block w-full text-left text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded transition-all"
                            >
                              {link.text} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs opacity-80 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4 max-w-xs border border-red-100 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-red-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="px-6 py-4 border-t border-red-200 bg-red-50/50 backdrop-blur-sm">
              <p className="text-xs text-red-700 mb-3 font-medium">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputText(suggestion.query);
                      setTimeout(handleSendMessage, 100);
                    }}
                    className="text-xs bg-white/80 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2 rounded-lg transition-all"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 backdrop-blur-sm">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={translations.askQuestion}
                  className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border border-red-200 rounded-xl focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              
              <button
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white animate-pulse' 
                    : 'bg-white/80 hover:bg-red-100 text-red-600 border border-red-200 transition-all'
                }`}
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white p-3 rounded-xl transition-all"
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;