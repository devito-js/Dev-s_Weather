export interface SatelliteSource {
  name: string;
  viewerUrl: string;
  mode: "external-viewer";
  description: string;
}
// Não há endpoint de imagem documentado e validado para esta integração estática.
export const satelliteSource: SatelliteSource = {
  name: "INPE / CPTEC · DSAT",
  viewerUrl: "https://www.cptec.inpe.br/dsat/",
  mode: "external-viewer",
  description:
    "Visualizador oficial. Incorporação sujeita às políticas do provedor; abertura externa sempre disponível.",
};
