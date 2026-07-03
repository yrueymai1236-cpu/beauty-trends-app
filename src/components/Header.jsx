import React from 'react';

const Header = ({ isDarkMode, setIsDarkMode, showFavorites, setShowFavorites, searchQuery, setSearchQuery }) => {
  return (
    <header className="header animate-fade-in">
      <div className="logo text-gradient">
        TrendGlow
      </div>

      <div className="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="ブランドや商品名で検索..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <nav className="header-actions">
        <a 
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('最新のコスメトレンドをチェック！美容好き必見のトレンド情報👀 #コスメトレンド #美容 #メイク')}&url=${encodeURIComponent('https://beauty-trends-app.onrender.com')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn share-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.076H5.078z"/>
          </svg>
          シェア
        </a>
        <button 
          className={`action-btn ${showFavorites ? 'active' : ''}`}
          onClick={() => setShowFavorites(!showFavorites)}
        >
          {showFavorites ? '💖 お気に入り一覧' : '🤍 お気に入り一覧'}
        </button>
        <button 
          className="action-btn theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
  );
};

export default Header;
