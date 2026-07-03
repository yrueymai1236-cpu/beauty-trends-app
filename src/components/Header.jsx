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
