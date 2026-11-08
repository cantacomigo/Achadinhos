import React, { useState } from 'react';
import { Search, X, MessageCircle, Send, Settings, ExternalLink } from 'lucide-react';
import { StoreConfig } from '../types';

interface HeaderProps {
  config: StoreConfig;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  searchQuery,
  onSearchChange,
  onOpenSettings,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const channelUrl = config.canalWhatsapp || config.canalTelegram;
  const isTelegram = !config.canalWhatsapp && Boolean(config.canalTelegram);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E0DED9] transition-all">
      {/* Top Notification Bar */}
      {config.mensagemTopo && (
        <div
          className="text-center py-2 px-4 text-xs md:text-sm font-medium tracking-wide text-white transition-colors"
          style={{
            backgroundColor: config.corBarraTopo || config.corPrimaria || '#2563EB',
          }}
        >
          {config.mensagemTopo}
        </div>
      )}

      {/* Main Header Row */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 md:h-[68px] flex items-center justify-between gap-3 md:gap-4">
        {/* Logo / Brand */}
        <div
          onClick={() => {
            onSearchChange('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 max-w-[50%] md:max-w-none group"
        >
          {config.logo && !logoError ? (
            <img
              src={config.logo}
              alt={config.storeName}
              onError={() => setLogoError(true)}
              className="max-h-9 md:max-h-11 max-w-[140px] md:max-w-[180px] object-contain rounded"
            />
          ) : (
            <span className="font-bold text-lg md:text-xl text-[#1B1B1B] tracking-tight truncate group-hover:opacity-90">
              {config.storeName}
            </span>
          )}
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-[440px] relative items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#A8A49C] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar achadinhos, cupons, marcas..."
            className="w-full pl-10 pr-9 py-2 rounded-full border border-[#E0DED9] bg-[#F7F7F5] text-sm text-[#1B1B1B] placeholder-[#A8A49C] focus:outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 p-1 rounded-full bg-[#E0DED9] text-[#4A4740] hover:bg-[#C8C5BE] transition"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 text-[#4A4740] hover:bg-gray-100 rounded-full transition"
            aria-label="Abrir busca"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Channel Button */}
          {channelUrl && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold text-white shadow-sm hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 transition-all ${
                isTelegram ? 'bg-[#229ED9]' : 'bg-[#25D366]'
              }`}
            >
              {isTelegram ? <Send className="w-4 h-4 shrink-0" /> : <MessageCircle className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">Canal de Ofertas</span>
            </a>
          )}

          {/* Config / Spreadsheet Manager Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-[#6B6760] hover:text-[#1B1B1B] hover:bg-[#F7F7F5] rounded-full transition"
            title="Configurações da Planilha"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-[#E0DED9] bg-white animate-in slide-in-from-top-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#A8A49C] pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar achadinhos..."
              className="w-full pl-9 pr-8 py-2 rounded-full border border-[#E0DED9] bg-[#F7F7F5] text-sm text-[#1B1B1B] focus:outline-none focus:border-[var(--primary)] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 rounded-full bg-[#E0DED9] text-[#4A4740]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
