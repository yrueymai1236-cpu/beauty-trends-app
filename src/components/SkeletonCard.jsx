import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="product-card skeleton-card">
      <div className="product-image-wrapper shimmer" style={{ backgroundColor: 'var(--border-color)' }}>
      </div>
      <div className="product-info">
        <div className="skeleton-text skeleton-brand shimmer"></div>
        <div className="skeleton-text skeleton-title shimmer"></div>
        
        <div className="product-recommenders" style={{ marginTop: '16px' }}>
          <div className="recommender-avatars">
            <div className="skeleton-avatar shimmer"></div>
            <div className="skeleton-avatar shimmer" style={{ marginLeft: '-8px' }}></div>
          </div>
          <div className="skeleton-text skeleton-desc shimmer" style={{ width: '50%', marginBottom: 0 }}></div>
        </div>

        <div className="product-meta" style={{ marginTop: '24px' }}>
          <div className="skeleton-text skeleton-price shimmer"></div>
          <div className="skeleton-text skeleton-likes shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
