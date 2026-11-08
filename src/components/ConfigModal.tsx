import React, { useState } from 'react';
import { X, RefreshCw, Check, RotateCcw, Link2, FileSpreadsheet, Send } from 'lucide-react';
import { AppConfig } from '../types';
import { DEFAULT_APP_CONFIG } from '../services/sheetService';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
  onReset: () => void;
  isReloading: boolean;
  onReload: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onReset,
  isReloading,
  onReload,
}) => {
  const [formData, setFormData] = useState<AppConfig>(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    onReset();
    setFormData(DEFAULT_APP_CONFIG);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E0DED9]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1B1B1B]">Configurações da Planilha</h3>
              <p className="text-xs text-[#6B6760]">Sincronização em tempo real via CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6B6760] hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1B1B1B] uppercase tracking-wide mb-1">
              URL da Aba Configurações (CSV)
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-[#A8A49C]" />
              <input
                type="url"
                required
                value={formData.planilha_configuracoes}
                onChange={(e) =>
                  setFormData({ ...formData, planilha_configuracoes: e.target.value })
                }
                placeholder="https://docs.google.com/spreadsheets/...pub?gid=...&output=csv"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-[#E0DED9] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B1B1B] uppercase tracking-wide mb-1">
              URL da Aba Catálogo (CSV)
            </label>
            <div className="relative">
              <FileSpreadsheet className="absolute left-3 top-2.5 w-4 h-4 text-[#A8A49C]" />
              <input
                type="url"
                required
                value={formData.planilha_catalogo}
                onChange={(e) =>
                  setFormData({ ...formData, planilha_catalogo: e.target.value })
                }
                placeholder="https://docs.google.com/spreadsheets/...pub?gid=...&output=csv"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-[#E0DED9] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B1B1B] uppercase tracking-wide mb-1">
              Webhook Google Apps Script (Cliques)
            </label>
            <div className="relative">
              <Send className="absolute left-3 top-2.5 w-4 h-4 text-[#A8A49C]" />
              <input
                type="url"
                value={formData.registrar_cliques}
                onChange={(e) =>
                  setFormData({ ...formData, registrar_cliques: e.target.value })
                }
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-[#E0DED9] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <p className="text-[11px] text-[#87837A] mt-1">
              Opcional. Registra os cliques dos afiliados diretamente na sua planilha.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E0DED9] flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onReload}
                disabled={isReloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0DED9] hover:bg-[#F7F7F5] text-xs font-semibold text-[#4A4740] transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                <span>{isReloading ? 'Atualizando...' : 'Recarregar'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0DED9] hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-[#87837A] transition"
                title="Restaurar URLs originais"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar</span>
              </button>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold transition shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo!</span>
                </>
              ) : (
                <span>Salvar Configurações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
