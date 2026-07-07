import React, { useState, useRef, useEffect } from 'react';

const AIChatWindow = ({ products = [], onOpenModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'こんにちは！TrendGlowの専属AI美容部員です✨ 乾燥肌のお悩みや、予算に合わせたおすすめコスメなど、何でも聞いてくださいね！', recs: [] }
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

  const submitMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });
      const data = await res.json();
      
      let reply = data.reply || 'エラーが発生しました。';
      let recProducts = [];

      // [RECS: Product1, Product2] を検出してパース
      const recsMatch = reply.match(/\[RECS:\s*([^\]]+)\]/);
      if (recsMatch) {
        const productNames = recsMatch[1].split(',').map(name => name.trim());
        productNames.forEach(name => {
          const match = products.find(p => p.name === name || p.name.includes(name) || name.includes(p.name));
          if (match) recProducts.push(match);
        });
        // メッセージ本文から推奨製品のタグを取り除く
        reply = reply.replace(/\[RECS:\s*[^\]]+\]/, '').trim();
      }

      setMessages(prev => [...prev, { role: 'ai', content: reply, recs: recProducts }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: '通信エラーが発生しました。もう一度お試しください！', recs: [] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    submitMessage(text);
  };

  const handleSuggestionClick = (text) => {
    if (isLoading) return;
    submitMessage(text);
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '100%' }}>
                <div className={`chat-bubble ${msg.role}`}>
                  {msg.content.split('\n').map((line, j) => (
                    <React.Fragment key={j}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
                {msg.recs && msg.recs.length > 0 && (
                  <div className="chat-recs" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {msg.recs.map(prod => (
                      <button 
                        key={prod.id} 
                        className="chat-rec-btn" 
                        onClick={() => onOpenModal(prod)}
                        style={{
                          background: 'var(--card-bg)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--primary-color)',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'all 0.2s'
                        }}
                      >
                        🛍️ {prod.brand} {prod.name.length > 18 ? prod.name.substring(0, 18) + '...' : prod.name}
                        {prod.priceValue ? ` (¥${prod.priceValue.toLocaleString()})` : ''}
                      </button>
                    ))}
                  </div>
                )}
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
 
        {/* Quick Suggestion Prompts */}
        <div className="chat-suggestions" style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 12px',
          overflowX: 'auto',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(var(--primary-color-rgb, 255, 117, 140), 0.02)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <style>{`
            .chat-suggestions::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {[
            { label: '🧴 乾燥肌向け', text: '乾燥肌におすすめのスキンケアを教えて' },
            { label: '💄 今バズってるリップ', text: '今SNSで一番バズっている人気のリップクリームや口紅は？' },
            { label: '💈 人気のメンズワックス', text: 'メンズヘアセット動画でよく使われる人気のワックスやスタイリング剤を教えて' },
            { label: '🧼 毛穴ケア洗顔料', text: '毛穴ケアや角栓対策におすすめのプチプラ洗顔料は？' }
          ].map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(s.text)}
              disabled={isLoading}
              style={{
                whiteSpace: 'nowrap',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.color = 'var(--primary-color)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              {s.label}
            </button>
          ))}
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
