import React from 'react';

const Hero = ({ products, onOpenModal }) => {
  const topProduct = products && products.length > 0 ? products[0] : null;

  if (!topProduct) {
    return (
      <div className="hero animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0.7 }}>
        <div className="hero-content">
          <span className="hero-badge">今日のトレンド #1</span>
          <h1 className="hero-title">VT COSMETICS <br/><span className="text-gradient">リードルショット</span></h1>
          <p className="hero-desc">トレンドデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleHeroClick = () => {
    if (onOpenModal) {
      onOpenModal(topProduct);
    }
  };

  const fallbackImages = [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1571781926291-c477eb3af53e?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1617897903246-719242758050?w=500&auto=format&fit=crop&q=60"
  ];
  const imageUrl = topProduct.image || fallbackImages[(topProduct.id || 0) % fallbackImages.length];

  return (
    <div 
      className="hero animate-fade-in" 
      style={{ animationDelay: '0.1s', cursor: 'pointer' }}
      onClick={handleHeroClick}
      title={`${topProduct.brand} ${topProduct.name} の詳細を見る`}
    >
      <div className="hero-content">
        <span className="hero-badge">今日のトレンド #1</span>
        <h1 className="hero-title">
          {topProduct.brand} <br/>
          <span className="text-gradient">{topProduct.name}</span>
        </h1>
        <p className="hero-desc">
          {topProduct.description || "SNSで話題沸騰中の大人気コスメ。詳細や口コミはこちらからチェック！"}
        </p>
      </div>
      <div className="hero-image-container">
        <img 
          src={imageUrl} 
          alt={topProduct.name} 
          className="hero-image"
        />
      </div>
    </div>
  );
};

export default Hero;
