import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaLeaf, FaPaperPlane, FaTimes, FaRobot } from 'react-icons/fa';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Namaste! I am your AI Agri-Assistant. Ask me about your crops or weather.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Ensure this URL matches your backend port (usually 5000)
      const response = await axios.post('http://localhost:5000/api/chat/ask', {
        question: userMessage.text
      });

      const botMessage = { type: 'bot', text: response.data.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { type: 'bot', text: "System busy. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl flex flex-col border border-green-100 mb-4 overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white text-green-600 p-1.5 rounded-full"><FaRobot size={14} /></div>
              <span className="font-bold tracking-wide">Agri-Advisor</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-green-700 p-1 rounded transition"><FaTimes /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.type === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}>{msg.text}</div>
              </div>
            ))}
            {isLoading && <div className="text-gray-500 text-xs italic ml-2">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-green-500"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 transition shadow-sm">
              <FaPaperPlane size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} className={`${isOpen ? 'rotate-90 bg-gray-500' : 'bg-green-600 hover:bg-green-700'} text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center`}>
        {isOpen ? <FaTimes size={20} /> : <FaLeaf size={20} />}
      </button>
    </div>
  );
};

export default ChatWidget;