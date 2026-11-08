import React, { useState } from 'react';
import { ImageOff, Sparkles, Play } from 'lucide-react';
import { Product } from '../types';
import { fp, ofertaExpiraEmBreve } from '../utils/csv';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, featured }) => {
  const [imgError, setImgError] = useState(false);

  const hasPromo =
    Boolean(product.precoPromo) &&
    product.precoPromo! > 0 &&
    product.preco > 0 &&
    product.precoPromo! < product.preco;

  const discountPercent = hasPromo
    ? Math.round((1 - product.precoPromo! / product.preco) * 100)
    : 0;

  const isLimited = ofertaExpiraEmBreve(product.validade);
  const displayPrice = hasPromo ? product.precoPromo! : product.preco;

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group relative bg-white rounded-xl md:rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
        featured
          ? 'border-[var(--primary)]/30 hover:border-[var(--primary)] shadow-sm hover:shadow-lg'
          : 'border-[#EFEFEC] hover:border-[#E0DED9] shadow-sm hover:shadow-md'
      } hover:-translate-y-1`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-[var(--primary)] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
          <Sparkles className="w-3 h-3" />
          <span>Destaque</span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square w-full bg-[#F7F7F5] overflow-hidden">
        {product.img1 && !imgError ? (
          <img
            src={product.img1}
            alt={product.nome}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#A8A49C] gap-1.5 p-4 text-center">
            <ImageOff className="w-8 h-8 opacity-60" />
            <span className="text-xs font-medium">Sem foto</span>
          </div>
        )}

        {/* Promo discount badge */}
        {hasPromo && discountPercent > 0 && (
          <span
            className={`absolute z-10 bg-[#E53E3E] text-white font-black text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${
              featured ? 'top-2.5 right-2.5' : 'top-2.5 left-2.5'
            }`}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Platform tag */}
        {product.plataforma && (
          <span
            className={`absolute z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] md:text-[11px] font-medium px-2 py-0.5 rounded-full truncate max-w-[50%] ${
              hasPromo && !featured ? 'top-2.5 right-2.5' : !featured ? 'top-2.5 right-2.5' : 'bottom-2.5 right-2.5'
            }`}
          >
            {product.plataforma}
          </span>
        )}

        {/* Limited Time Badge */}
        {isLimited && (
          <span className="absolute bottom-2.5 left-2.5 z-10 bg-[#B45309] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
            Oferta Relâmpago
          </span>
        )}

        {/* Video indicator badge */}
        {Boolean(product.video) && (
          <span className="absolute bottom-2.5 right-2.5 z-10 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>Vídeo</span>
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 md:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category breadcrumb */}
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[#87837A] mb-1 truncate">
            {product.categoria}
            {product.subcategoria ? ` · ${product.subcategoria}` : ''}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm md:text-[15px] text-[#1B1B1B] leading-snug line-clamp-2 mb-2 group-hover:text-[var(--primary)] transition-colors">
            {product.nome}
          </h3>
        </div>

        <div>
          {/* Price */}
          {displayPrice > 0 ? (
            <div className="flex items-baseline flex-wrap gap-1.5 mb-3">
              {product.tipo !== 'DIGITAL' && (
                <span className="text-[11px] text-[#87837A] font-medium">a partir de</span>
              )}
              <span className="text-base md:text-lg font-bold text-[var(--primary)]">
                R$ {fp(displayPrice)}
              </span>
              {hasPromo && (
                <span className="text-xs text-[#A8A49C] line-through">
                  R$ {fp(product.preco)}
                </span>
              )}
            </div>
          ) : (
            <div className="mb-3 text-xs text-[#87837A] font-medium">
              Consulte a oferta
            </div>
          )}

          {/* View Details Button */}
          <button
            type="button"
            className="w-full py-2 px-3 rounded-lg bg-[#F7F7F5] border border-[#E0DED9] text-xs font-semibold text-[#1B1B1B] group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)] group-hover:text-white transition-all duration-200"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
