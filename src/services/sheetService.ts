import { AppConfig, StoreConfig, Product } from '../types';
import {
  parseCSV,
  parsePrecoBR,
  parseDataBR,
  ofertaValida,
  fixImg,
  toSlug,
  nameToHex,
  darkenColor,
} from '../utils/csv';

export const DEFAULT_APP_CONFIG: AppConfig = {
  planilha_configuracoes:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnvhLksflgSQ--BcLoeejHNOYuxHLfEynTEWiRwdwqbOlrasROeqV_i1HlR__GmMWQ1zq_kqn_ChJP/pub?gid=480609827&single=true&output=csv',
  planilha_catalogo:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTnvhLksflgSQ--BcLoeejHNOYuxHLfEynTEWiRwdwqbOlrasROeqV_i1HlR__GmMWQ1zq_kqn_ChJP/pub?gid=952991100&single=true&output=csv',
  registrar_cliques:
    'https://script.google.com/macros/s/AKfycbyLjLrtrWAJcsyEGwqvt1dz7rXhMafY03qjBDQv6Zk4eTid2o88td0fT5y3kgYCgJnkSw/exec',
};

const STORAGE_KEY = 'planiloja_app_config';

export function getAppConfig(): AppConfig {
  const win = typeof window !== 'undefined' ? (window as unknown as { ACHADINHOS?: Partial<AppConfig> }) : undefined;
  const baseConfig: AppConfig = {
    planilha_configuracoes: win?.ACHADINHOS?.planilha_configuracoes || DEFAULT_APP_CONFIG.planilha_configuracoes,
    planilha_catalogo: win?.ACHADINHOS?.planilha_catalogo || DEFAULT_APP_CONFIG.planilha_catalogo,
    registrar_cliques: win?.ACHADINHOS?.registrar_cliques || DEFAULT_APP_CONFIG.registrar_cliques,
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        planilha_configuracoes: parsed.planilha_configuracoes || baseConfig.planilha_configuracoes,
        planilha_catalogo: parsed.planilha_catalogo || baseConfig.planilha_catalogo,
        registrar_cliques: parsed.registrar_cliques || baseConfig.registrar_cliques,
      };
    }
  } catch (e) {
    console.error('Error reading saved config', e);
  }
  return baseConfig;
}

export function saveAppConfig(cfg: AppConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error('Error saving config', e);
  }
}

export function resetAppConfig(): AppConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting config', e);
  }
  return DEFAULT_APP_CONFIG;
}

export async function fetchStoreConfig(csvUrl: string): Promise<StoreConfig> {
  const url = csvUrl.includes('?') ? `${csvUrl}&_t=${Date.now()}` : `${csvUrl}?_t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Falha ao carregar configurações (HTTP ${res.status})`);
  }
  const text = await res.text();
  const rows = parseCSV(text);

  const cfg: Partial<StoreConfig> = {};

  for (const row of rows) {
    if (!row[0] && !row[1]) continue;
    const field = (row[0] || '').replace(/[⚙️📋🎨🚚🏷️💳💡]/g, '').trim().toUpperCase();
    const val = (row[1] || '').trim();

    if (!field || field === 'CAMPO' || field === 'VALOR' || field === 'INSTRUÇÕES') continue;
    if (field.includes('CONFIGURAÇÕES') || field.includes('PREENCHA')) continue;
    if (field.includes('DADOS DA LOJA') || field.includes('PERSONALIZAÇÃO') || field.includes('CANAL DE OFERTAS') || field.includes('AVISOS')) continue;

    if (field === 'NOME DA LOJA') cfg.storeName = val;
    else if (field === 'LOGO (URL)') cfg.logo = val;
    else if (field === 'INSTAGRAM') cfg.instagram = val;
    else if (field === 'FACEBOOK') cfg.facebook = val;
    else if (field === 'TIKTOK') cfg.tiktok = val;
    else if (field === 'PIXEL FACEBOOK') cfg.pixelFacebook = val;
    else if (field === 'GOOGLE ANALYTICS') cfg.googleAnalytics = val;
    else if (field === 'GOOGLE ADS') cfg.googleAds = val;
    else if (field === 'COR PRIMÁRIA' || field === 'COR PRIMARIA') cfg.corPrimaria = val;
    else if (field === 'BANNER (URL)') cfg.bannerUrl = val;
    else if (field === 'BANNER LINK') cfg.bannerLink = val;
    else if (field === 'BANNER TAG') cfg.bannerTag = val;
    else if (field === 'BANNER TÍTULO' || field === 'BANNER TITULO') cfg.bannerTitulo = val;
    else if (field === 'BANNER SUBTÍTULO' || field === 'BANNER SUBTITULO') cfg.bannerSubtitulo = val;
    else if (field === 'TITULO DO SITE' || field === 'TÍTULO DO SITE' || field === 'TITULO DA PAGINA') cfg.tituloSite = val;
    else if (field === 'DESCRICAO DO SITE' || field === 'DESCRIÇÃO DO SITE' || field === 'META DESCRICAO' || field === 'META DESCRIÇÃO') cfg.descricaoSite = val;
    else if (field === 'LOJA ATIVA') cfg.lojaAtiva = val.toUpperCase() !== 'NÃO' && val.toUpperCase() !== 'NAO';
    else if (field === 'MENSAGEM MANUTENCAO' || field === 'MENSAGEM MANUTENÇÃO' || field === 'MENSAGEM MANUTENÇAO') cfg.msgManutencao = val;
    else if (field === 'MENSAGEM TOPO' || field === 'BARRA TOPO') cfg.mensagemTopo = val;
    else if (field === 'COR BARRA TOPO' || field === 'COR MENSAGEM TOPO') cfg.corBarraTopo = val;
    else if (field === 'CNPJ') cfg.cnpj = val;
    else if (field === 'ENDERECO' || field === 'ENDEREÇO' || field === 'ENDERECO DA LOJA' || field === 'ENDEREÇO DA LOJA') cfg.endereco = val;
    else if (field === 'EMAIL' || field === 'EMAIL DE CONTATO') cfg.email = val;
    else if (field === 'CANAL WHATSAPP' || (field === 'WHATSAPP' && !cfg.canalWhatsapp)) {
      if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
        const cleanNumber = val.replace(/\D/g, '');
        cfg.canalWhatsapp = `https://wa.me/${cleanNumber}`;
      } else {
        cfg.canalWhatsapp = val;
      }
    }
    else if (field === 'CANAL TELEGRAM') cfg.canalTelegram = val;
    else if (field === 'BOTÃO CANAL FLUTUANTE' || field === 'BOTAO CANAL FLUTUANTE') cfg.botaoCanalFlutuante = val.toUpperCase() === 'SIM';
    else if (field === 'TEXTO DISCLOSURE') cfg.textoDisclosure = val;
    else if (field === 'AVISO PREÇOS' || field === 'AVISO PRECOS') cfg.avisoPrecos = val;
  }

  // Fallbacks
  const storeName = cfg.storeName || 'Planiloja Achadinhos';
  const corPrimaria = cfg.corPrimaria || '#2563EB';
  const primaryHex = nameToHex(corPrimaria) || (corPrimaria.startsWith('#') ? corPrimaria : '#2563EB');
  const corSecundaria = darkenColor(primaryHex, 0.2);

  return {
    storeName,
    logo: cfg.logo || '',
    instagram: cfg.instagram || '',
    facebook: cfg.facebook || '',
    tiktok: cfg.tiktok || '',
    pixelFacebook: cfg.pixelFacebook || '',
    googleAnalytics: cfg.googleAnalytics || '',
    googleAds: cfg.googleAds || '',
    corPrimaria: primaryHex,
    corSecundaria,
    bannerUrl: cfg.bannerUrl || '',
    bannerLink: cfg.bannerLink || '',
    bannerTag: cfg.bannerTag || '',
    bannerTitulo: cfg.bannerTitulo || '',
    bannerSubtitulo: cfg.bannerSubtitulo || '',
    tituloSite: cfg.tituloSite || `${storeName} — Achadinhos`,
    descricaoSite: cfg.descricaoSite || 'Encontre as melhores ofertas, achadinhos e cupons verificados.',
    lojaAtiva: cfg.lojaAtiva !== false,
    msgManutencao: cfg.msgManutencao || 'Estamos em manutenção. Voltamos em breve!',
    mensagemTopo: cfg.mensagemTopo || '',
    corBarraTopo: cfg.corBarraTopo || '',
    cnpj: cfg.cnpj || '',
    endereco: cfg.endereco || '',
    email: cfg.email || '',
    canalWhatsapp: cfg.canalWhatsapp || '',
    canalTelegram: cfg.canalTelegram || '',
    botaoCanalFlutuante: cfg.botaoCanalFlutuante !== false,
    textoDisclosure:
      cfg.textoDisclosure ||
      'Este site participa de programas de afiliados e pode receber comissão pelas compras realizadas nos links, sem custo adicional para você.',
    avisoPrecos: cfg.avisoPrecos || 'Preços e disponibilidade sujeitos a alteração. Confirme na loja parceira.',
  };
}

export async function fetchCatalog(csvUrl: string): Promise<Product[]> {
  const url = csvUrl.includes('?') ? `${csvUrl}&_t=${Date.now()}` : `${csvUrl}?_t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Falha ao carregar catálogo (HTTP ${res.status})`);
  }
  const text = await res.text();
  const rows = parseCSV(text);

  const products: Product[] = [];
  let index = 0;

  for (const row of rows) {
    const first = (row[0] || '').trim().toUpperCase();
    if (
      !first ||
      first === 'ATIVO' ||
      first === 'ATIVO *' ||
      first === 'SIM OU NÃO' ||
      first.includes('CATÁLOGO') ||
      first.includes('CATALOGO') ||
      first.includes('CADA LINHA') ||
      first.includes('DICAS')
    ) {
      continue;
    }
    if (first !== 'SIM') continue;

    const nome = (row[5] || '').trim();
    const linkAfiliado = (row[11] || '').trim();
    if (!nome || !linkAfiliado) continue;

    const validade = parseDataBR(row[10]);
    if (!ofertaValida(validade)) continue;

    const preco = parsePrecoBR(row[7]);
    const precoPromoRaw = row[8] ? parsePrecoBR(row[8]) : null;
    const precoPromo = precoPromoRaw && precoPromoRaw > 0 ? precoPromoRaw : null;

    products.push({
      id: `p-${index++}`,
      slug: toSlug(nome),
      ativo: true,
      tipo: (row[1] || '').trim().toUpperCase() === 'DIGITAL' ? 'DIGITAL' : 'FISICO',
      plataforma: (row[2] || '').trim(),
      categoria: (row[3] || '').trim() || 'Geral',
      subcategoria: (row[4] || '').trim(),
      nome,
      descricao: (row[6] || '').trim(),
      preco,
      precoPromo,
      cupom: (row[9] || '').trim(),
      validade,
      linkAfiliado,
      textoBotao: (row[12] || '').trim(),
      video: (row[13] || '').trim(),
      img1: fixImg((row[14] || '').trim()),
      img2: fixImg((row[15] || '').trim()),
      img3: fixImg((row[16] || '').trim()),
      img4: fixImg((row[17] || '').trim()),
      ordem: parseInt(row[18], 10) || 9999,
      destaque: row.length > 19 && (row[19] || '').trim().toUpperCase() === 'SIM',
    });
  }

  return products;
}

// Click rate-limiting
const clickRecords: Record<string, number> = {};

export function registrarClique(product: Product, scriptUrl: string): void {
  if (!scriptUrl) return;

  const key = `${product.nome}_${product.plataforma}`;
  const now = Date.now();
  if (clickRecords[key] && now - clickRecords[key] < 300000) {
    return; // rate limited within 5 mins
  }
  clickRecords[key] = now;

  try {
    const utms: string[] = [];
    const params = new URLSearchParams(window.location.search);
    params.forEach((v, k) => {
      if (k.toLowerCase().startsWith('utm_')) utms.push(`${k}=${v}`);
    });
    const origem = [document.referrer, utms.join('&')].filter(Boolean).join(' | ');

    const payload = {
      dataHora: new Date().toLocaleString('pt-BR'),
      produto: product.nome,
      plataforma: product.plataforma,
      tipo: product.tipo,
      categoria: product.categoria,
      origem: origem || 'Site Direto',
    };

    const targetUrl = `${scriptUrl}?data=${encodeURIComponent(JSON.stringify(payload))}`;
    fetch(targetUrl, { mode: 'no-cors' }).catch(() => {
      // no-cors fallback via Image beacon
      const img = new Image();
      img.src = targetUrl;
    });
  } catch (err) {
    console.warn('Erro ao registrar clique:', err);
  }
}
