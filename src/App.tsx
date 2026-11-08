import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowUp,
  MessageCircle,
  Send,
  AlertTriangle,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { AppConfig, StoreConfig, Product } from './types';
import {
  getAppConfig,
  saveAppConfig,
  resetAppConfig,
  fetchStoreConfig,
  fetchCatalog,
  registrarClique,
} from './services/sheetService';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { Banner } from './components/Banner';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { Footer } from './components/Footer';
import { ConfigModal } from './components/ConfigModal';

export default function App() {
  const [appConfig, setAppConfig] = useState<AppConfig>(getAppConfig);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Load store and products
  const loadData = useCallback(async (cfg: AppConfig) => {
    try {
      setError(null);
      const [fetchedConfig, fetchedProducts] = await Promise.all([
        fetchStoreConfig(cfg.planilha_configuracoes),
        fetchCatalog(cfg.planilha_catalogo),
      ]);

      setStoreConfig(fetchedConfig);
      setProducts(fetchedProducts);

      // Apply dynamic colors to CSS variables
      if (fetchedConfig.corPrimaria) {
        document.documentElement.style.setProperty('--primary', fetchedConfig.corPrimaria);
        const hex = fetchedConfig.corPrimaria.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) || 37;
        const g = parseInt(hex.substring(2, 4), 16) || 99;
        const b = parseInt(hex.substring(4, 6), 16) || 235;
        document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
        document.documentElement.style.setProperty(
          '--primary-light',
          `rgba(${r}, ${g}, ${b}, 0.08)`
        );
        document.documentElement.style.setProperty(
          '--primary-hover',
          `rgb(${Math.max(0, r - 25)}, ${Math.max(0, g - 25)}, ${Math.max(0, b - 25)})`
        );
      }
      if (fetchedConfig.corSecundaria) {
        document.documentElement.style.setProperty('--secondary', fetchedConfig.corSecundaria);
      }

      // Update document title
      if (fetchedConfig.tituloSite) {
        document.title = fetchedConfig.tituloSite;
      }

      // Check URL for direct product slug
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('produto');
      if (slug) {
        const found = fetchedProducts.find((p) => p.slug === slug);
        if (found) {
          setSelectedProduct(found);
        }
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar loja:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a loja. Verifique se a planilha está publicada na web como CSV.'
      );
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  }, []);

  useEffect(() => {
    loadData(appConfig);
  }, [appConfig, loadData]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute Categories
  const categories = useMemo(() => {
    const list = ['Todos'];
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.categoria) cats.add(p.categoria);
    });
    return [...list, ...Array.from(cats)];
  }, [products]);

  // Compute Subcategories for active category
  const subcategories = useMemo(() => {
    if (activeCategory === 'Todos') return [];
    const subs = new Set<string>();
    products.forEach((p) => {
      if (p.categoria === activeCategory && p.subcategoria) {
        subs.add(p.subcategoria);
      }
    });
    return Array.from(subs);
  }, [products, activeCategory]);

  // Banner filter click handler
  const handleBannerFilter = (value: string) => {
    if (value.includes('>')) {
      const parts = value.split('>');
      const cat = parts[0].trim();
      const sub = parts[1].trim();
      setActiveCategory(cat);
      setActiveSubcategory(sub);
    } else {
      setActiveCategory(value.trim());
      setActiveSubcategory(null);
    }
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.descricao.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          p.subcategoria.toLowerCase().includes(q) ||
          p.plataforma.toLowerCase().includes(q) ||
          p.cupom.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== 'Todos') {
      list = list.filter((p) => p.categoria === activeCategory);
    }

    // Subcategory filter
    if (activeSubcategory) {
      list = list.filter((p) => p.subcategoria === activeSubcategory);
    }

    // Sort by order ascending
    list.sort((a, b) => a.ordem - b.ordem);
    return list;
  }, [products, searchQuery, activeCategory, activeSubcategory]);

  // Featured products (only when on Todos and no active search)
  const featuredProducts = useMemo(() => {
    if (activeCategory !== 'Todos' || activeSubcategory || searchQuery.trim()) {
      return [];
    }
    return products.filter((p) => p.destaque).sort((a, b) => a.ordem - b.ordem);
  }, [products, activeCategory, activeSubcategory, searchQuery]);

  // Affiliate click & tracking
  const handleAffiliateClick = (product: Product) => {
    registrarClique(product, appConfig.registrar_cliques);

    // Google Analytics / Ads / FB pixel window events if present
    const win = window as unknown as {
      fbq?: (type: string, event: string, params: object) => void;
      gtag?: (type: string, action: string, params: object) => void;
    };
    if (typeof win.fbq === 'function') {
      win.fbq('track', 'Lead', {
        content_name: product.nome,
        value: product.precoPromo || product.preco,
        currency: 'BRL',
      });
    }
    if (typeof win.gtag === 'function') {
      win.gtag('event', 'click_oferta', {
        item_name: product.nome,
        currency: 'BRL',
        value: product.precoPromo || product.preco,
      });
    }

    window.open(product.linkAfiliado, '_blank', 'noopener,noreferrer');
  };

  // Handle configuration update
  const handleSaveConfig = (newCfg: AppConfig) => {
    saveAppConfig(newCfg);
    setAppConfig(newCfg);
    setIsReloading(true);
    loadData(newCfg);
  };

  const handleResetConfig = () => {
    const defaultCfg = resetAppConfig();
    setAppConfig(defaultCfg);
    setIsReloading(true);
    loadData(defaultCfg);
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FAFAF8] flex flex-col items-center justify-center z-50">
        <div className="w-12 h-12 rounded-full border-3 border-[#E0DED9] border-t-[var(--primary)] animate-spin" />
        <p className="mt-4 text-sm font-semibold text-[#6B6760] tracking-wide">
          Carregando achadinhos da planilha...
        </p>
      </div>
    );
  }

  // Maintenance Screen
  if (storeConfig && storeConfig.lojaAtiva === false) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#E0DED9]">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] mb-2">{storeConfig.storeName}</h1>
          <p className="text-sm text-[#6B6760] leading-relaxed mb-6">
            {storeConfig.msgManutencao || 'Estamos em manutenção. Voltamos em breve!'}
          </p>
          {(storeConfig.canalWhatsapp || storeConfig.canalTelegram) && (
            <a
              href={storeConfig.canalWhatsapp || storeConfig.canalTelegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-bold shadow-md hover:opacity-95 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Acompanhar no Canal de Ofertas</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !storeConfig) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-center">
        <div className="max-w-lg bg-white p-8 rounded-2xl shadow-md border border-[#E0DED9]">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#1B1B1B] mb-2">
            Não foi possível carregar a vitrine
          </h2>
          <p className="text-sm text-[#6B6760] mb-6 leading-relaxed">
            {error || 'Verifique se as planilhas do Google estão publicadas como CSV.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                setLoading(true);
                loadData(appConfig);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold shadow-sm hover:opacity-95 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E0DED9] bg-white text-sm font-semibold text-[#1B1B1B] hover:bg-gray-50 transition"
            >
              <span>Verificar URLs da Planilha</span>
            </button>
          </div>
        </div>

        <ConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          config={appConfig}
          onSave={handleSaveConfig}
          onReset={handleResetConfig}
          isReloading={isReloading}
          onReload={() => loadData(appConfig)}
        />
      </div>
    );
  }

  const floatingChannelUrl = storeConfig.canalWhatsapp || storeConfig.canalTelegram;
  const isFloatingTelegram = !storeConfig.canalWhatsapp && Boolean(storeConfig.canalTelegram);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      {/* Header */}
      <Header
        config={storeConfig}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setShowConfigModal(true)}
      />

      {/* Categories & Subcategories Nav */}
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setActiveSubcategory(null);
        }}
        subcategories={subcategories}
        activeSubcategory={activeSubcategory}
        onSelectSubcategory={setActiveSubcategory}
      />

      {/* Banner */}
      {!searchQuery && (
        <Banner config={storeConfig} onBannerFilter={handleBannerFilter} />
      )}

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8 flex-1 w-full">
        {/* Featured Section */}
        {featuredProducts.length > 0 && (
          <section className="mb-10 bg-[var(--primary)]/5 p-4 sm:p-6 rounded-2xl border border-[var(--primary)]/15">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-extrabold text-[var(--primary)] tracking-tight">
                🔥 Destaques da Semana
              </h2>
              <span className="text-xs font-semibold text-[#87837A]">
                {featuredProducts.length} {featuredProducts.length === 1 ? 'oferta' : 'ofertas'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={`featured-${product.id}`}
                  product={product}
                  onSelect={setSelectedProduct}
                  featured
                />
              ))}
            </div>
          </section>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-[#E0DED9]/60">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1B1B1B] tracking-tight">
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : activeCategory === 'Todos'
                ? 'Todos os Achadinhos'
                : activeCategory}
            </h2>
            {activeSubcategory && (
              <p className="text-xs font-medium text-[#87837A] mt-0.5">
                Subcategoria: <span className="font-bold text-[#1B1B1B]">{activeSubcategory}</span>
              </p>
            )}
          </div>
          <span className="text-xs md:text-sm font-semibold text-[#87837A] shrink-0">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'oferta' : 'ofertas'}
          </span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E0DED9] my-6">
            <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#1B1B1B] mb-1">
              Nenhum achadinho encontrado
            </h3>
            <p className="text-xs text-[#6B6760] max-w-sm mx-auto mb-4">
              Tente buscar por outro termo ou navegue por outras categorias para encontrar ofertas.
            </p>
            {(searchQuery || activeCategory !== 'Todos' || activeSubcategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('Todos');
                  setActiveSubcategory(null);
                }}
                className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 transition"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer config={storeConfig} />

      {/* Floating Channel Button */}
      {storeConfig.botaoCanalFlutuante && floatingChannelUrl && (
        <a
          href={floatingChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Canal de Ofertas"
          className={`fixed bottom-6 left-6 z-40 w-13 h-13 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all ${
            isFloatingTelegram ? 'bg-[#229ED9]' : 'bg-[#25D366]'
          }`}
        >
          {isFloatingTelegram ? (
            <Send className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </a>
      )}

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white border border-[#E0DED9] text-[#4A4740] shadow-md hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-white flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5`}
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        config={storeConfig}
        onClose={() => setSelectedProduct(null)}
        onAffiliateClick={handleAffiliateClick}
      />

      {/* Spreadsheet / Config Modal */}
      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        config={appConfig}
        onSave={handleSaveConfig}
        onReset={handleResetConfig}
        isReloading={isReloading}
        onReload={() => loadData(appConfig)}
      />
    </div>
  );
}
