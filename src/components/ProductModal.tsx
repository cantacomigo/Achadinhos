import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Tag,
  AlertCircle,
  Play,
  ImageOff,
} from 'lucide-react';
import { Product, StoreConfig } from '../types';
import { fp, getVideoInfo } from '../utils/csv';

interface ProductModalProps {
  product: Product | null;
  config: StoreConfig;
  onClose: () => void;
  onAffiliateClick: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  config,
  onClose,
  onAffiliateClick,
}) => {
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImg(product.img1);
      setCopiedCoupon(false);
      setCopiedLink(false);
      setImgError(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  const images = [product.img1, product.img2, product.img3, product.img4].filter(Boolean);

  const hasPromo =
    Boolean(product.precoPromo) &&
    product.precoPromo! > 0 &&
    product.preco > 0 &&
    product.precoPromo! < product.preco;

  const displayPrice = hasPromo ? product.precoPromo! : product.preco;
  const videoInfo = getVideoInfo(product.video);

  const handleCopyCoupon = () => {
    if (!product.cupom) return;
    navigator.clipboard.writeText(product.cupom).then(() => {
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2500);
    });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?produto=${product.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const getCtaLabel = () => {
    if (product.textoBotao) return product.textoBotao;
    if (product.tipo === 'DIGITAL') return 'Quero conhecer →';
    return product.plataforma ? `Ver oferta na ${product.plataforma} →` : 'Ver oferta →';
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col md:grid md:grid-cols-2 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#4A4740] shadow-md border border-[#E0DED9] flex items-center justify-center transition hover:scale-105"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Gallery */}
        <div className="flex flex-col bg-[#F7F7F5] border-b md:border-b-0 md:border-r border-[#E0DED9]">
          {/* Main Selected Image */}
          <div className="relative aspect-square w-full bg-[#F7F7F5] overflow-hidden flex items-center justify-center">
            {selectedImg && !imgError ? (
              <img
                src={selectedImg}
                alt={product.nome}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain md:object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#A8A49C] gap-2 p-6">
                <ImageOff className="w-12 h-12 opacity-50" />
                <span className="text-sm font-medium">Imagem indisponível</span>
              </div>
            )}

            {/* Promo Discount Tag */}
            {hasPromo && (
              <span className="absolute top-4 left-4 bg-[#E53E3E] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                -{Math.round((1 - product.precoPromo! / product.preco) * 100)}%
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 bg-white/80 border-t border-[#E0DED9] overflow-x-auto justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImg(img);
                    setImgError(false);
                  }}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImg === img
                      ? 'border-[var(--primary)] shadow-sm scale-105 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & CTA */}
        <div className="p-5 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
          <div>
            {/* Meta Category & Platform */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {product.plataforma && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                  {product.plataforma}
                </span>
              )}
              {product.tipo === 'DIGITAL' && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  Digital
                </span>
              )}
              <span className="text-xs font-medium text-[#87837A] uppercase tracking-wider">
                {product.categoria} {product.subcategoria ? `· ${product.subcategoria}` : ''}
              </span>
            </div>

            {/* Product Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B1B1B] tracking-tight leading-snug mb-3">
              {product.nome}
            </h2>

            {/* Price Box */}
            {displayPrice > 0 ? (
              <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-[#EFEFEC]">
                {product.tipo !== 'DIGITAL' && (
                  <span className="text-xs text-[#87837A] font-medium">a partir de</span>
                )}
                <span className="text-2xl sm:text-3xl font-extrabold text-[var(--primary)]">
                  R$ {fp(displayPrice)}
                </span>
                {hasPromo && (
                  <span className="text-sm sm:text-base text-[#A8A49C] line-through">
                    R$ {fp(product.preco)}
                  </span>
                )}
              </div>
            ) : (
              <div className="mb-4 pb-4 border-b border-[#EFEFEC] text-sm text-[#87837A]">
                Oferta sob consulta na loja parceira
              </div>
            )}

            {/* Description */}
            {product.descricao && (
              <div className="text-sm text-[#4A4740] leading-relaxed whitespace-pre-line mb-5">
                {product.descricao}
              </div>
            )}

            {/* Coupon Box */}
            {product.cupom && (
              <div className="flex items-center justify-between gap-3 p-3.5 mb-5 rounded-xl border border-dashed border-[var(--primary)] bg-[var(--primary)]/5">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Cupom de desconto</span>
                  </div>
                  <div className="font-mono font-bold text-base text-[#1B1B1B] mt-0.5">
                    {product.cupom}
                  </div>
                </div>
                <button
                  onClick={handleCopyCoupon}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition active:scale-95 shrink-0"
                >
                  {copiedCoupon ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Video Preview */}
            {videoInfo && (
              <div className="mb-5">
                {videoInfo.type === 'youtube' && videoInfo.embedUrl && (
                  <div className="rounded-xl overflow-hidden aspect-video bg-black shadow-inner">
                    <iframe
                      src={videoInfo.embedUrl}
                      title="Vídeo do produto"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                )}

                {videoInfo.type === 'direct' && videoInfo.embedUrl && (
                  <div className="rounded-xl overflow-hidden aspect-video bg-black shadow-inner">
                    <video
                      controls
                      src={videoInfo.embedUrl}
                      className="w-full h-full object-contain"
                    >
                      Seu navegador não suporta a reprodução deste vídeo.
                    </video>
                  </div>
                )}

                {videoInfo.type === 'external' && (
                  <a
                    href={videoInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#E0DED9] bg-gradient-to-r from-neutral-900 to-neutral-800 text-white hover:from-black hover:to-neutral-900 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#EE4D2D] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#EE4D2D]">
                          Vídeo Demonstrativo {videoInfo.platform ? `· ${videoInfo.platform}` : ''}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-white truncate">
                          {videoInfo.label}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 group-hover:bg-white/25 text-xs font-bold text-white transition shrink-0 border border-white/20">
                      <span>Assistir</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-2">
            {/* Direct Affiliate Link */}
            <button
              onClick={() => onAffiliateClick(product)}
              className="w-full py-3.5 px-5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover,#1D4ED8)] text-white text-base font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{getCtaLabel()}</span>
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Price Disclaimer */}
            {displayPrice > 0 && config.avisoPrecos && (
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#87837A] mt-2 text-center">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{config.avisoPrecos}</span>
              </div>
            )}

            {/* Share / Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="mt-3 mx-auto flex items-center gap-1.5 text-xs text-[#87837A] hover:text-[var(--primary)] font-medium transition cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600 font-semibold">Link copiado com sucesso!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar oferta</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
