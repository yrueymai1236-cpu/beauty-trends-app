import React, { useState, useRef, useEffect } from 'react';

const AIChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'こんにちは！TrendGlowの専属AI美容部員です✨ 乾燥肌のお悩みや、予算に合わせたおすすめコスメなど、何でも聞いてくださいね！' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', content: data.reply || 'エラーが発生しました。' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: '通信エラーが発生しました。もう一度お試しください！' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button 
        className="chat-fab animate-bounce-in"
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <span style={{ fontSize: '24px' }}>💬</span>
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <span style={{ fontSize: '20px' }}>🤖</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>AI 美容部員</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>オンライン</div>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-container ${msg.role}`}>
              {msg.role === 'ai' && <div className="chat-avatar">🤖</div>}
              <div className={`chat-bubble ${msg.role}`}>
                {msg.content.split('\n').map((line, j) => (
                  <React.Fragment key={j}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-bubble-container ai">
              <div className="chat-avatar">🤖</div>
              <div className="chat-bubble ai typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="コスメの悩みを相談..." 
            disabled={isLoading}
          />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            送信
          </button>
        </div>
      </div>
    </>
  );
};

export default AIChatWindow;
