import React from 'react';

const ProductModal = ({ product, isOpen, onClose }) => {
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
            <div className="product-brand" style={{marginTop: '16px'}}>{product.brand}</div>
            <h2 className="modal-title">{product.name}</h2>
            <p className="modal-desc">{product.description || "現在AIが詳細情報を収集中です..."}</p>
            
            <div className="modal-section">
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
              <span className="product-price">{product.price}</span>
              <button className="buy-button">公式サイトで見る</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
