import React, { useState, useEffect } from 'react';

const ProductModal = ({ product, isOpen, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) return;

    setSummary(null);
    setIsLoadingSummary(true);

    fetch(`/api/trends/${product.id}/summary`)
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setIsLoadingSummary(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingSummary(false);
      });
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const fallbackImages = [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1571781926291-c477eb3af53e?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1617897903246-719242758050?w=500&auto=format&fit=crop&q=60"
  ];
  const imageUrl = product.image || fallbackImages[(product.id || 0) % fallbackImages.length];
  const safeColors = product.colors || [];
  const safeReviews = product.reviews || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          <img src={imageUrl} alt={product.name} className="modal-image" />
          <div className="modal-info">
            <span className="source-tag" style={{position: 'relative', top: 0, left: 0, display: 'inline-block'}}>{product.source}</span>
            <h2 className="modal-title" style={{marginTop: '16px', marginBottom: '8px'}}>{product.name}</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div className="modal-price" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {product.priceValue ? `¥${product.priceValue.toLocaleString()}` : '価格未定'}
              </div>
              {product.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px', color: '#ffb142', fontWeight: 600 }}>
                  ⭐ {product.rating} <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 400 }}>({product.reviewcount}件)</span>
                </div>
              )}
            </div>

            <p className="modal-desc">{(summary && summary.description) || product.description || (isLoadingSummary ? "詳細情報を読み込み中..." : "現在AIが詳細情報を収集中です...")}</p>

            {/* AI 口コミ要約 */}
            <div className="modal-section" style={{ marginTop: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                🤖 AI 口コミ要約
              </h3>
              {isLoadingSummary ? (
                <div style={{ padding: '16px 0', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: '14px', borderRadius: '4px', background: 'var(--border-color)', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
                  <div style={{ width: '85%', height: '14px', borderRadius: '4px', background: 'var(--border-color)', opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
                </div>
              ) : summary ? (
                <div className="ai-summary-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <div style={{
                    background: 'rgba(46, 204, 113, 0.06)',
                    border: '1px solid rgba(46, 204, 113, 0.15)',
                    borderRadius: '12px',
                    padding: '12px 14px'
                  }}>
                    <strong style={{ color: '#2ecc71', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      🟢 メリット・良い点
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                      {summary.positives?.map((pos, idx) => <li key={idx}>{pos}</li>)}
                    </ul>
                  </div>
                  <div style={{
                    background: 'rgba(231, 76, 60, 0.05)',
                    border: '1px solid rgba(231, 76, 60, 0.12)',
                    borderRadius: '12px',
                    padding: '12px 14px'
                  }}>
                    <strong style={{ color: '#e74c3c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      ⚠️ デメリット・注意点
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                      {summary.negatives?.map((neg, idx) => <li key={idx}>{neg}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>口コミの読み込みに失敗しました。</p>
              )}
            </div>


            
            <div className="modal-section" style={{ marginTop: '20px' }}>
              <h3>主な年齢層</h3>
              <p className="age-group-text">{product.ageGroup || "調査中"}</p>
            </div>

            {safeColors.length > 0 && (
              <div className="modal-section">
                <h3>カラー展開</h3>
                <div className="color-list">
                  {safeColors.map((c, i) => <span key={i} className="color-chip">{c}</span>)}
                </div>
              </div>
            )}

            {safeReviews.length > 0 && (
              <div className="modal-section">
                <h3>注目の口コミ</h3>
                <div className="review-list">
                  {safeReviews.map((r, i) => (
                    <div key={i} className="review-item">
                      <div className="review-header">
                        <strong>{r.user}</strong>
                        <span className="review-rating">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                      </div>
                      <p>"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <div className="affiliate-buttons">
                <a 
                  href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(product.name)}&tag=hurikake09-22`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="aff-btn amazon-btn"
                >
                  Amazonで探す
                </a>
                <a 
                  href={`https://hb.afl.rakuten.co.jp/ichiba/5575e209.dc820559.5575e20a.58f7287d/?pc=${encodeURIComponent('https://search.rakuten.co.jp/search/mall/' + encodeURIComponent(product.name) + '/')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="aff-btn rakuten-btn"
                >
                  楽天市場で探す
                </a>
                <a 
                  href={`https://www.qoo10.jp/s/goodssearch?keyword=${encodeURIComponent(product.name)}&su=1467680797`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="aff-btn qoo10-btn"
                >
                  Qoo10で探す
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
