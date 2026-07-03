import React from 'react';
import ProductCard from './ProductCard';

const TrendList = ({ products, favorites, toggleFavorite, onOpenModal }) => {
  if (products.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        このカテゴリーのアイテムは見つかりませんでした。
      </div>
    );
  }

  return (
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
  );
};

export default TrendList;
