import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, X } from 'lucide-react';

const TBChatbot = ({ patient }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: `Hello ${patient?.name || 'there'}! I'm your TB Treatment Companion powered by AI. I'm here to help you with medication questions, side effects, and emotional support. How are you feeling today?`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Real Claude AI API call
  const callClaudeAPI = async (userMessage, conversationHistory) => {
    const systemPrompt = `You are a compassionate and knowledgeable TB (Tuberculosis) Treatment Companion AI assistant. 

Your role is to help TB patients with:
- Medication questions (dosage, timing, missed doses, drug names like Rifampicin, Isoniazid, Pyrazinamide, Ethambutol)
- Side effects guidance (nausea, orange urine, dizziness, joint pain, yellow skin/jaundice)
- Emotional support and motivation for patients feeling discouraged
- Diet and lifestyle advice during TB treatment
- Drug interaction warnings (alcohol, birth control, HIV medicines)
- Treatment progress questions
- Explaining TB symptoms and transmission
- Hindi language support if patient writes in Hindi

Patient Info:
- Name: ${patient?.name || 'Patient'}
- Current Streak: ${patient?.currentStreak || 0} days
- Total Days Completed: ${patient?.totalDays || 0} days
- Adherence Rate: ${patient?.adherenceRate || 0}%

Important guidelines:
- Always be warm, encouraging and empathetic
- Give specific, accurate medical information about TB
- For serious symptoms (severe jaundice, breathing difficulty, severe rash) always advise to contact doctor immediately
- Keep responses concise but complete (3-5 sentences max)
- If patient seems emotionally distressed, prioritize emotional support
- Never tell patient to stop medication without doctor consultation
- You can respond in Hindi if the patient writes in Hindi
- Use emojis occasionally to keep tone friendly 💊❤️💪`;

    // Build conversation history for context
    const apiMessages = conversationHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.message
    }));

    // Add current message
    apiMessages.push({
      role: 'user',
      content: userMessage
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: apiMessages
      })
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    const data = await response.json();
    return data.content[0].text;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Pass conversation history for context (last 10 messages)
      const conversationHistory = updatedMessages.slice(-10);
      const aiResponse = await callClaudeAPI(inputMessage, conversationHistory.slice(0, -1));

      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chatbot error:', error);

      // ✅ Fallback response if API fails
      const fallbackResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: "I'm having trouble connecting right now. Please try again in a moment. If you have an urgent medical concern, contact your doctor directly. 🏥",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What are names of TB medicines?",
    "I missed my dose, what do I do?",
    "What are common side effects?",
    "Can I stop if I feel better?",
    "I feel discouraged 😔",
    "Can I drink alcohol?",
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {/* Chatbot Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-40 flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">TB Treatment Companion</h3>
                <p className="text-sm opacity-90">✨ Powered by Real AI</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp}
                  </p>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-3 shadow-sm">
                  <div className="flex space-x-1 items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-xs text-gray-400 ml-1">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions — show only at start */}
          {messages.length === 1 && (
            <div className="p-3 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-2 font-medium">💬 Quick questions:</p>
              <div className="flex flex-wrap gap-1">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about TB..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">
              For emergencies, always contact your doctor 🏥
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default TBChatbot;