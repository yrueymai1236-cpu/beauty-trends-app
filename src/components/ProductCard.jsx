import React from 'react';

const ProductCard = ({ product, index, isFavorite, toggleFavorite, onOpenModal }) => {
  const delay = `${0.3 + index * 0.1}s`;
  const rank = product.originalRank || index + 1;
  const rankClass = rank <= 3 ? `rank-${rank}` : '';

  // 画像がない場合の美しいプレースホルダー画像（美容系Unsplash画像）
  const fallbackImages = [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1571781926291-c477eb3af53e?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1617897903246-719242758050?w=500&auto=format&fit=crop&q=60"
  ];
  // IDを使ってランダムかつ固定の画像を選ぶ
  const imageUrl = product.image || fallbackImages[(product.id || index) % fallbackImages.length];

  return (
    <div className="product-card animate-fade-in" style={{ animationDelay: delay }} onClick={() => onOpenModal(product)}>
      <div className="product-image-wrapper">
        <div className={`ranking-badge ${rankClass}`}>
          {rank}
        </div>
        <span className="source-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          {product.source}
        </span>
        <img src={imageUrl} alt={product.name} className="product-image" />
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-recommenders">
          <div className="recommender-avatars">
            {product.recommendedBy && product.recommendedBy.map((rec, i) => (
              <img 
                key={i} 
                src={rec.avatar} 
                alt={rec.name} 
                title={rec.name}
                className="recommender-avatar" 
                style={{ zIndex: product.recommendedBy.length - i }} 
              />
            ))}
          </div>
          <span className="recommender-text">
            {product.recommendedBy && product.recommendedBy.length > 0 && (
              <>
                <span className="recommender-name">{product.recommendedBy[0].name}</span>
                {product.recommendedBy.length > 1 ? ` ほか${product.recommendedBy.length - 1}名がおすすめ` : ' がおすすめ'}
              </>
            )}
          </span>
        </div>

        <div className="product-meta">
          <span className="product-price">
            {product.priceValue ? `¥${product.priceValue.toLocaleString()}` : '価格未定'}
          </span>
          
          <div className="product-metrics" style={{ display: 'flex', alignItems: 'center' }}>
            {product.rating > 0 && (
              <span className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#ffb142', fontWeight: 600 }}>
                ⭐ {product.rating} <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 400 }}>({product.reviewcount}件)</span>
              </span>
            )}
            <span className="product-likes" style={{ marginLeft: '12px' }}>
              <svg className="heart-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {product.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
