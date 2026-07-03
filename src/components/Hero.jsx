import React from 'react';

const Hero = () => {
  return (
    <div className="hero animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="hero-content">
        <span className="hero-badge">今日のトレンド #1</span>
        <h1 className="hero-title">VT COSMETICS <br/><span className="text-gradient">リードルショット</span></h1>
        <p className="hero-desc">
          SNSで話題沸騰中！天然の微細針（シリカ）が美容成分の浸透をサポート。自宅でできる新感覚の「塗る美容鍼」で、つるんとしたなめらか肌へ。
        </p>
      </div>
      <div className="hero-image-container">
        <img 
          src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
          alt="VT リードルショット" 
          className="hero-image"
        />
      </div>
    </div>
  );
};

export default Hero;
