import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import SubCategoryFilter from './components/SubCategoryFilter';
import SortFilter from './components/SortFilter';
import TrendList from './components/TrendList';
import ProductModal from './components/ProductModal';
import SkeletonCard from './components/SkeletonCard';
import './components.css';

const categories = ["すべて", "スキンケア", "メイクアップ", "ヘアケア", "フレグランス"];

function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('すべて');
  const [activeSubCategory, setActiveSubCategory] = useState('すべて');
  const [sortType, setSortType] = useState('recommend');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('beauty-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/trends');
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

  if (sortType === 'price-asc') {
    finalProducts.sort((a, b) => a.priceValue - b.priceValue);
  } else if (sortType === 'likes-desc') {
    finalProducts.sort((a, b) => b.likesValue - a.likesValue);
  } else {
    finalProducts.sort((a, b) => a.originalRank - b.originalRank);
  }

  return (
    <div className="container">
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

        <div className="filters-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap'}}>
          <div className="category-filters">
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
          <SortFilter sortType={sortType} setSortType={setSortType} />
        </div>

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
