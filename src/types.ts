export interface AppConfig {
  planilha_configuracoes: string;
  planilha_catalogo: string;
  registrar_cliques: string;
}

export interface StoreConfig {
  storeName: string;
  logo?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  pixelFacebook?: string;
  googleAnalytics?: string;
  googleAds?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  bannerUrl?: string;
  bannerLink?: string;
  bannerTag?: string;
  bannerTitulo?: string;
  bannerSubtitulo?: string;
  tituloSite?: string;
  descricaoSite?: string;
  lojaAtiva: boolean;
  msgManutencao?: string;
  mensagemTopo?: string;
  corBarraTopo?: string;
  cnpj?: string;
  endereco?: string;
  email?: string;
  canalWhatsapp?: string;
  canalTelegram?: string;
  botaoCanalFlutuante: boolean;
  textoDisclosure: string;
  avisoPrecos: string;
}

export interface Product {
  id: string;
  slug: string;
  ativo: boolean;
  tipo: 'FISICO' | 'DIGITAL';
  plataforma: string;
  categoria: string;
  subcategoria: string;
  nome: string;
  descricao: string;
  preco: number;
  precoPromo: number | null;
  cupom: string;
  validade: Date | null;
  linkAfiliado: string;
  textoBotao: string;
  video: string;
  img1: string;
  img2: string;
  img3: string;
  img4: string;
  ordem: number;
  destaque: boolean;
}
