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
import AIChatWindow from './components/AIChatWindow';
import './components.css';

const categories = ["すべて", "スキンケア", "メイクアップ", "ヘアケア", "ボディケア", "フレグランス"];

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
  const [displayCount, setDisplayCount] = useState(20);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sharedIds, setSharedIds] = useState([]);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsPushEnabled(!!sub);
        });
      });
    }
  }, []);

  const togglePushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('お使いのブラウザはプッシュ通知に対応していません。');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      
      if (isPushEnabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          setIsPushEnabled(false);
          alert('通知をオフにしました。');
        }
      } else {
        const keyRes = await fetch('/api/push/key');
        const { publicKey } = await keyRes.json();
        if (!publicKey) {
          alert('プッシュ通知の準備ができていません。');
          return;
        }

        const padding = '='.repeat((4 - (publicKey.length % 4)) % 4);
        const base64 = (publicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray
        });

        const regRes = await fetch('/api/push/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub })
        });

        if (regRes.ok) {
          setIsPushEnabled(true);
          alert('登録完了しました！毎日1位のトレンドコスメを通知します！🔔✨');
        } else {
          alert('通知の登録に失敗しました。');
        }
      }
    } catch (err) {
      console.error("Push toggle failed:", err);
      alert('プッシュ通知の登録中にエラーが発生しました。ブラウザの設定で通知許可がオンになっているかご確認ください。');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (shareParam) {
      const ids = shareParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      setSharedIds(ids);
    }
  }, []);

  const clearShareView = () => {
    setSharedIds([]);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const shareFavorites = () => {
    if (favorites.length === 0) {
      alert('お気に入りに商品がありません！まずはハートマークをタップして追加してください。');
      return;
    }
    const shareUrl = `${window.location.origin}/?share=${favorites.join(',')}`;
    navigator.clipboard.writeText(shareUrl);
    alert('シェア用URLをコピーしました！SNSやLINEで共有してください✨\n\n' + shareUrl);
  };

  useEffect(() => {
    if (products.length === 0) return;
    
    // 既存のJSON-LDを削除
    const existingScript = document.getElementById('jsonld-schema');
    if (existingScript) existingScript.remove();

    // 上位10個の商品で構造化データを生成
    const topProducts = products.slice(0, 10);
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": topProducts.map((p, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": p.name,
          "image": p.image,
          "brand": {
            "@type": "Brand",
            "name": p.brand
          },
          "offers": {
            "@type": "Offer",
            "price": p.priceValue,
            "priceCurrency": "JPY"
          },
          "aggregateRating": p.rating ? {
            "@type": "AggregateRating",
            "ratingValue": p.rating,
            "reviewCount": p.reviewcount || 1
          } : undefined
        }
      }))
    };

    const script = document.createElement('script');
    script.id = 'jsonld-schema';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);
  }, [products]);


  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  useEffect(() => {
    setDisplayCount(20);
  }, [activeCategory, activeSubCategory, sortType, searchQuery, showFavorites]);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
  };

  let baseList = sharedIds.length > 0
    ? products.filter(p => sharedIds.includes(p.id))
    : (showFavorites 
        ? products.filter(p => favorites.includes(p.id))
        : products);

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

  // 制限なし（もしくは多めに制限）
  // finalProducts = finalProducts.slice(0, 30);

  if (sortType === 'price-asc') {
    finalProducts.sort((a, b) => (a.priceValue || 99999) - (b.priceValue || 99999));
  } else if (sortType === 'price-desc') {
    finalProducts.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
  } else if (sortType === 'likes-desc') {
    finalProducts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    finalProducts.sort((a, b) => a.originalRank - b.originalRank);
  }

  const displayedProducts = finalProducts.slice(0, displayCount);
  const hasMore = displayCount < finalProducts.length;

  return (
    <div className={`container ${isDarkMode ? 'dark-mode' : ''}`}>
      <Header 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        showFavorites={showFavorites} 
        setShowFavorites={setShowFavorites}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isPushEnabled={isPushEnabled}
        onTogglePush={togglePushSubscription}
      />
      <main>
        {!showFavorites && <Hero />}
        
        {showFavorites && <h2 style={{marginBottom: '24px'}}>お気に入りリスト</h2>}

        <div className="filters-row" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px'}}>
          <div className="filter-section" style={{ margin: 0 }}>
            <SortFilter sortType={sortType} setSortType={setSortType} />
          </div>
          <div className="category-filters" style={{ width: '100%', minWidth: 0 }}>
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
        </div>

        <div className="app-content-wrapper">
          <div className="main-content">
            {sharedIds.length > 0 && (
              <div className="shared-banner" style={{
                background: 'rgba(255, 107, 129, 0.08)',
                border: '1px solid var(--primary-color)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-color)' }}>👥 シェアされたおすすめトレンド</span>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>誰かがセレクトしたおすすめのコスメ一覧です（{finalProducts.length}件）</p>
                </div>
                <button 
                  onClick={clearShareView}
                  style={{
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  すべての商品を見る ➡️
                </button>
              </div>
            )}

            {showFavorites && favorites.length > 0 && sharedIds.length === 0 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button 
                  onClick={shareFavorites}
                  style={{
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(255, 107, 129, 0.3)'
                  }}
                >
                  🔗 このお気に入りリストをSNSでシェア
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="trend-grid">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <TrendList 
                products={displayedProducts} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite}
                onOpenModal={setModalProduct}
                hasMore={hasMore}
                onLoadMore={() => setDisplayCount(prev => prev + 20)}
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

      <AIChatWindow products={products} onOpenModal={setModalProduct} />

      <button 
        className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </div>
  );
}

export default App;
