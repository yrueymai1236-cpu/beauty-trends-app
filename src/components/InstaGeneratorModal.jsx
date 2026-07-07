import React, { useRef, useEffect, useState } from 'react';

const InstaGeneratorModal = ({ products = [], isOpen, onClose }) => {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const top3 = products.slice(0, 3);

  const preloadImages = (urls) => {
    return Promise.all(urls.map(url => {
      return new Promise((resolve) => {
        if (!url) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    }));
  };

  useEffect(() => {
    if (!isOpen || !canvasRef.current || top3.length < 3) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setIsGenerating(true);
    setErrorMsg('');

    // Set canvas dimensions
    canvas.width = 1080;
    canvas.height = 1080;

    // Draw background placeholder while images load
    drawPlaceholder(ctx);

    const imageUrls = top3.map(p => p.image);

    preloadImages(imageUrls).then(images => {
      try {
        drawCanvas(ctx, images);
      } catch (err) {
        console.error("Canvas draw error:", err);
        setErrorMsg('画像の生成中にエラーが発生しました。CORS制限が原因の可能性があります。');
      } finally {
        setIsGenerating(false);
      }
    });
  }, [isOpen, products]);

  const drawPlaceholder = (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = '#ff6b81';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('画像を生成中...', 540, 540);
  };

  const drawCanvas = (ctx, images) => {
    // 1. Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#FFF5F7');
    grad.addColorStop(1, '#FFEBEF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative circles
    ctx.fillStyle = 'rgba(255, 107, 129, 0.04)';
    ctx.beginPath();
    ctx.arc(100, 100, 350, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(980, 980, 450, 0, Math.PI * 2);
    ctx.fill();

    // 2. Title Section
    // Title Badge
    ctx.fillStyle = 'rgba(255, 107, 129, 0.08)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(360, 60, 360, 48, 24);
    else ctx.rect(360, 60, 360, 48);
    ctx.fill();

    ctx.fillStyle = '#ff6b81';
    ctx.font = 'bold 20px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ TrendGlow バズコスメ速報 ✨', 540, 92);

    // Main Title
    ctx.fillStyle = '#1e272e';
    ctx.font = 'bold 44px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText('本日の美容トレンドランキング TOP 3', 540, 175);

    // 3. Stacked Product Cards
    const colors = ['#f1c40f', '#95a5a6', '#d35400']; // Gold, Silver, Bronze
    
    top3.forEach((prod, index) => {
      const y = 220 + index * 240;
      const x = 90;
      const w = 900;
      const h = 210;

      // Card Container
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(255, 107, 129, 0.08)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, 24);
      else ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.shadowColor = 'transparent'; // Reset shadow

      // Rank Badge
      ctx.fillStyle = colors[index];
      ctx.beginPath();
      ctx.arc(x + 55, y + 105, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`${index + 1}`, x + 55, y + 118);

      // Product Image
      const img = images[index];
      const imgSize = 150;
      const imgX = x + 120;
      const imgY = y + 30;

      if (img) {
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      } else {
        // Fallback placeholder box
        ctx.fillStyle = '#f8f9fa';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(imgX, imgY, imgSize, imgSize, 12);
        else ctx.rect(imgX, imgY, imgSize, imgSize);
        ctx.fill();
        
        ctx.fillStyle = '#b2bec3';
        ctx.font = '14px sans-serif';
        ctx.fillText('No Image', imgX + imgSize/2, imgY + imgSize/2 + 5);
      }

      // Brand Name
      ctx.fillStyle = 'rgba(30, 39, 46, 0.6)';
      ctx.font = 'bold 20px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(prod.brand || '', x + 295, y + 65);

      // Product Name
      ctx.fillStyle = '#1e272e';
      ctx.font = 'bold 26px "Helvetica Neue", Arial, sans-serif';
      const maxLen = 22;
      const displayName = prod.name.length > maxLen ? prod.name.substring(0, maxLen) + '...' : prod.name;
      ctx.fillText(displayName, x + 295, y + 110);

      // Price & Stats
      ctx.fillStyle = '#ff6b81';
      ctx.font = 'bold 26px "Helvetica Neue", Arial, sans-serif';
      ctx.fillText(prod.priceValue ? `¥${prod.priceValue.toLocaleString()}` : '価格未定', x + 295, y + 160);

      // Buzz likes score on the right side
      ctx.fillStyle = '#ff9f43';
      ctx.font = 'bold 22px "Helvetica Neue", Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`🔥 ${prod.likes?.toLocaleString() || 0} Likes`, x + w - 40, y + 115);
    });

    // 4. Footer Section
    ctx.fillStyle = 'rgba(30, 39, 46, 0.4)';
    ctx.font = '20px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('最新のトレンド情報はプロフィールのリンクをチェック 👉 @trendglow', 540, 1010);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'trendglow_insta_post.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content animate-fade-in" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Instagramまとめ画像ジェネレーター</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', textAlign: 'center', flex: 1 }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', margin: '0 0 16px' }}>
            「本日のバズコスメTOP 3」のまとめ画像を1080x1080解像度で生成しました。このまま保存してInstagramやLemon8、TikTokに投稿できます。
          </p>

          <div style={{ 
            width: '100%', 
            paddingTop: '100%', 
            position: 'relative', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            boxShadow: 'var(--shadow-md)',
            background: '#ffffff',
            marginBottom: '20px'
          }}>
            <canvas 
              ref={canvasRef} 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                objectFit: 'contain'
              }} 
            />
          </div>

          {errorMsg && <p style={{ color: 'var(--secondary-color)', fontSize: '12px', marginBottom: '12px' }}>{errorMsg}</p>}

          <button 
            onClick={handleDownload} 
            disabled={isGenerating}
            style={{
              background: 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 129, 0.3)',
              width: '100%'
            }}
          >
            {isGenerating ? '画像を生成中...' : '画像を保存する (PNG)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstaGeneratorModal;
