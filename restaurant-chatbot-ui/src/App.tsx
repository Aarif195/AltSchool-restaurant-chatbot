import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from './api/chatApi';

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message instantly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize the chatbot conversation on mount
  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      try {
        const data = await sendMessage(''); // Empty message initializes session state
        setMessages([{ sender: 'bot', text: data.response }]);
      } catch (error) {
        setMessages([
          { sender: 'bot', text: 'Error connecting to server. Please try refreshing.' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = input.trim();
    if (!cleanInput || loading) return;

    // Append user's selection locally first
    setMessages((prev) => [...prev, { sender: 'user', text: cleanInput }]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendMessage(cleanInput);
      setMessages((prev) => [...prev, { sender: 'bot', text: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Failed to transmit message. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-brand-dark justify-center items-center p-0 sm:p-4">
      {/* Chat Container Window */}
      <div className="flex flex-col h-full w-full max-w-md bg-brand-surface sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Top Header Section */}
        <header className="bg-brand-primary p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h1 className="font-bold text-lg tracking-wide">BitesBot</h1>
              <p className="text-xs text-indigo-200">Automated Order Assistant</p>
            </div>
          </div>
        </header>

        {/* Dynamic Chat Messages Sub-View */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-brand-primary text-white rounded-br-none'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-400 border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 text-xs flex items-center space-x-1 shadow-sm">
                <span className="font-medium">BitesBot is typing</span>
                <span className="animate-bounce">.</span>
                <span className="animate-bounce [animation-delay:0.2s]">.</span>
                <span className="animate-bounce [animation-delay:0.4s]">.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Interactive Form Controls */}
        <footer className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your menu option option here..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-brand-primary transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand-primary text-white font-semibold rounded-xl px-5 py-3 text-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-indigo-100"
            >
              Send
            </button>
          </form>
        </footer>

      </div>
    </div>
  );
}