import React, { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

const TrendList = ({ products, favorites, toggleFavorite, onOpenModal, hasMore, onLoadMore }) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, hasMore, onLoadMore]);
  if (products.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        このカテゴリーのアイテムは見つかりませんでした。
      </div>
    );
  }

  return (
    <>
      <div className="trend-grid">
        {products.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={index} 
            isFavorite={favorites.includes(product.id)}
            toggleFavorite={toggleFavorite}
            onOpenModal={onOpenModal}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }}></div>
      )}
      {!hasMore && products.length > 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          すべての商品を読み込みました
        </div>
      )}
    </>
  );
};

export default TrendList;
