import React from 'react';

const SortFilter = ({ sortType, setSortType }) => {
  return (
    <div className="sort-filter animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <select 
        className="sort-select" 
        value={sortType} 
        onChange={(e) => setSortType(e.target.value)}
      >
        <option value="recommend">おすすめ順</option>
        <option value="price-asc">価格が安い順</option>
        <option value="likes-desc">いいねが多い順</option>
      </select>
    </div>
  );
};

export default SortFilter;
