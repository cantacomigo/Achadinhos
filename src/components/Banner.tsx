import React, { useState } from 'react';
import { StoreConfig } from '../types';

interface BannerProps {
  config: StoreConfig;
  onBannerFilter: (value: string) => void;
}

export const Banner: React.FC<BannerProps> = ({ config, onBannerFilter }) => {
  const [imgError, setImgError] = useState(false);

  if (!config.bannerUrl || imgError) return null;

  const hasOverlay = Boolean(config.bannerTag || config.bannerTitulo || config.bannerSubtitulo);

  const handleClick = () => {
    if (!config.bannerLink) return;
    if (config.bannerLink.startsWith('http://') || config.bannerLink.startsWith('https://')) {
      window.open(config.bannerLink, '_blank', 'noopener,noreferrer');
    } else {
      onBannerFilter(config.bannerLink);
    }
  };

  return (
    <section className="max-w-[1200px] mx-auto px-4 md:px-6 my-4 md:my-6">
      <div
        onClick={config.bannerLink ? handleClick : undefined}
        className={`relative overflow-hidden rounded-xl md:rounded-2xl shadow-sm border border-[#E0DED9] ${
          config.bannerLink ? 'cursor-pointer group' : ''
        }`}
      >
        <img
          src={config.bannerUrl}
          alt={config.bannerTitulo || 'Banner de ofertas'}
          onError={() => setImgError(true)}
          className="w-full h-44 sm:h-52 md:h-64 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {hasOverlay && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center px-6 sm:px-10 md:px-14">
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
