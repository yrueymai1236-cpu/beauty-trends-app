import React from 'react';

const SubCategoryFilter = ({ subCategories, activeSubCategory, setActiveSubCategory }) => {
  if (subCategories.length <= 1) return null; // Only "すべて" exists

  return (
    <div className="sub-category-filter animate-fade-in" style={{ animationDelay: '0.25s' }}>
      {subCategories.map((subCategory) => (
        <button
          key={subCategory}
          className={`sub-category-btn ${activeSubCategory === subCategory ? 'active' : ''}`}
          onClick={() => setActiveSubCategory(subCategory)}
        >
          {subCategory}
        </button>
      ))}
    </div>
  );
};

export default SubCategoryFilter;
