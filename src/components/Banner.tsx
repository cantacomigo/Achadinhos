import React, { useState } from 'react';
import { StoreConfig } from '../types';
import { fixImg } from '../utils/csv';

interface BannerProps {
  config: StoreConfig;
  onBannerFilter: (value: string) => void;
}

export const Banner: React.FC<BannerProps> = ({ config, onBannerFilter }) => {
  const [imgError, setImgError] = useState(false);

  const bannerImg = fixImg(config.bannerUrl);
  const hasOverlay = Boolean(config.bannerTag || config.bannerTitulo || config.bannerSubtitulo);

  // If there's neither an image nor any text overlay, do not render
  if ((!bannerImg || imgError) && !hasOverlay) {
    return null;
  }

  const handleClick = () => {
    if (!config.bannerLink) return;
    if (config.bannerLink.startsWith('http://') || config.bannerLink.startsWith('https://')) {
      window.open(config.bannerLink, '_blank', 'noopener,noreferrer');
    } else {
      onBannerFilter(config.bannerLink);
    }
  };

  const showImage = bannerImg && !imgError;

  return (
    <section className="max-w-[1200px] mx-auto px-4 md:px-6 my-4 md:my-6">
      <div
        onClick={config.bannerLink ? handleClick : undefined}
        className={`relative overflow-hidden rounded-xl md:rounded-2xl shadow-sm border border-[#E0DED9] ${
          config.bannerLink ? 'cursor-pointer group' : ''
        } ${!showImage ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary,#1B1B1B)] min-h-[170px] sm:min-h-[200px] md:min-h-[220px]' : ''}`}
      >
        {showImage && (
          <img
            src={bannerImg}
            alt={config.bannerTitulo || 'Banner de ofertas'}
            onError={() => setImgError(true)}
            className="w-full h-44 sm:h-52 md:h-64 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}

        {hasOverlay && (
          <div
            className={`flex flex-col justify-center px-6 sm:px-10 md:px-14 ${
              showImage
                ? 'absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent'
                : 'py-10'
            }`}
          >
            {config.bannerTag && (
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/90 mb-1.5 drop-shadow-sm">
                {config.bannerTag}
              </span>
            )}
            {config.bannerTitulo && (
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug max-w-xl drop-shadow-sm">
                {config.bannerTitulo}
              </h2>
            )}
            {config.bannerSubtitulo && (
              <p className="text-xs sm:text-sm text-white/90 mt-1.5 max-w-lg leading-relaxed drop-shadow-sm">
                {config.bannerSubtitulo}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
