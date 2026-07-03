import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import SubCategoryFilter from './components/SubCategoryFilter';
import SortFilter from './components/SortFilter';
import TrendList from './components/TrendList';
import ProductModal from './components/ProductModal';
import SkeletonCard from './components/SkeletonCard';
import Sidebar from './components/Sidebar';
import './components.css';

const categories = ["すべて", "スキンケア", "メイクアップ", "ヘアケア"];

function App() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('beauty-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('すべて');
  const [activeSubCategory, setActiveSubCategory] = useState('すべて');
  const [sortType, setSortType] = useState('recommend');
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('/api/trends');
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch trends", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrends();
  }, []);

  useEffect(() => {
    localStorage.setItem('beauty-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  useEffect(() => {
    setActiveSubCategory('すべて');
  }, [activeCategory]);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  let baseList = showFavorites 
    ? products.filter(p => favorites.includes(p.id))
    : products;

  let categoryProducts = activeCategory === 'すべて' 
    ? baseList 
    : baseList.filter(p => p.category === activeCategory);

  const availableSubCategories = ['すべて', ...new Set(categoryProducts.map(p => p.subCategory))];

  let finalProducts = activeSubCategory === 'すべて'
    ? categoryProducts
    : categoryProducts.filter(p => p.subCategory === activeSubCategory);

  finalProducts = finalProducts.map((p, index) => ({
    ...p,
    originalRank: index + 1
  }));

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    finalProducts = finalProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q)
    );
  }

  // 最大10件に制限
  finalProducts = finalProducts.slice(0, 10);

  if (sortType === 'price-asc') {
    finalProducts.sort((a, b) => (a.priceValue || 99999) - (b.priceValue || 99999));
  } else if (sortType === 'likes-desc') {
    finalProducts.sort((a, b) => (b.likesValue || 0) - (a.likesValue || 0));
  } else {
    finalProducts.sort((a, b) => a.originalRank - b.originalRank);
  }

  return (
    <div className={`container ${isDarkMode ? 'dark-mode' : ''}`}>
      <Header 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        showFavorites={showFavorites} 
        setShowFavorites={setShowFavorites}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main>
        {!showFavorites && <Hero />}
        
        {showFavorites && <h2 style={{marginBottom: '24px'}}>お気に入りリスト</h2>}

        <div className="filters-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px'}}>
          <div className="category-filters" style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
            <CategoryFilter 
              categories={categories} 
              activeCategory={activeCategory} 
              setActiveCategory={setActiveCategory} 
            />
            <SubCategoryFilter 
              subCategories={availableSubCategories}
              activeSubCategory={activeSubCategory}
              setActiveSubCategory={setActiveSubCategory}
            />
          </div>
          <div className="filter-section">
            <SortFilter sortType={sortType} setSortType={setSortType} />
          </div>
        </div>

        <div className="app-content-wrapper">
          <div className="main-content">
            {isLoading ? (
              <div className="trend-grid">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <TrendList 
                products={finalProducts} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite}
                onOpenModal={setModalProduct}
              />
            )}
          </div>
          <Sidebar activeCategory={activeCategory} />
        </div>
      </main>

      <ProductModal 
        product={modalProduct} 
        isOpen={!!modalProduct} 
        onClose={() => setModalProduct(null)} 
      />
    </div>
  );
}

export default App;
