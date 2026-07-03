import React from 'react';

const ProductModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          <img src={product.image} alt={product.name} className="modal-image" />
          <div className="modal-info">
            <span className="source-tag" style={{position: 'relative', top: 0, left: 0, display: 'inline-block'}}>{product.source}</span>
            <div className="product-brand" style={{marginTop: '16px'}}>{product.brand}</div>
            <h2 className="modal-title">{product.name}</h2>
            <p className="modal-desc">{product.description}</p>
            
            <div className="modal-section">
              <h3>主な年齢層</h3>
              <p className="age-group-text">{product.ageGroup}</p>
            </div>

            <div className="modal-section">
              <h3>カラー展開</h3>
              <div className="color-list">
                {product.colors.map((c, i) => <span key={i} className="color-chip">{c}</span>)}
              </div>
            </div>

            <div className="modal-section">
              <h3>注目の口コミ</h3>
              <div className="review-list">
                {product.reviews.map((r, i) => (
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
