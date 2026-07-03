import React from 'react';

const CategoryFilter = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="category-filter animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
