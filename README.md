# Dev's Weather

Monitoramento Meteorológico Regional de **Pompeia – SP, Brasil**. Dashboard estático em português, com tema grafite, mapa Leaflet/OpenStreetMap, radar RainViewer e previsão Open-Meteo. Sem backend, banco de dados, autenticação ou chaves privadas. As requisições partem do navegador.

## Executar

Requisitos: Node.js 22 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000. Para produção:

```sh
npm run typecheck
npm run build
```

O resultado fica em `out/`. Sirva essa pasta por HTTP; abrir `index.html` por `file://` não é suportado. Exemplo, com Python instalado:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory out
```

Esse servidor serve apenas arquivos para inspeção local; a hospedagem final não executa Python nem Node. Não existem API routes, server actions ou processamento meteorológico no servidor.

## Funcionalidades

- Localização inicial: -22.1089, -50.1761; fuso America/Sao_Paulo.
- Temperatura, sensação térmica, umidade, pressão na superfície, velocidade/direção de origem do vento e precipitação do intervalo corrente de 15 minutos.
- Sete dias de previsão; gráfico horário das próximas 24 horas e histórico das últimas 24 horas. A consulta solicita dois dias anteriores para completar a janela móvel. Os pontos representam temperatura; abaixo estão chuva em mm e probabilidade em %. Não são medições de estação local.
- Radar das últimas duas horas: play/pause, controle temporal, horário completo, zoom, recentralização, opacidade e máscara opcional de áreas sem cobertura.
- Satélite: acesso ao visualizador oficial DSAT, com incorporação opcional sob ação do usuário e link externo permanente. Não há API própria de imagens, horário de atualização ou animação de satélite inventados; esses controles pertencem ao DSAT.
- Status independente das fontes, horário de consulta, atualização manual e automática: previsão a cada 15 minutos e radar a cada 10. Consultas periódicas ficam suspensas quando a aba está oculta.
- Timeout de 15 segundos, cancelamento de consultas, validação de estrutura, valores ausentes mostrados como travessão e preservação da última resposta em caso de falha. Última resposta é mantida apenas em memória, sem armazenamento de histórico.
- Responsividade, controles com nomes acessíveis, foco de teclado e respeito à preferência por movimento reduzido.
- Manifest, favicon SVG, metadata, Open Graph e tema preparados para PWA. Não há service worker, modo offline garantido ou push; instalação depende do navegador e de requisitos adicionais de ícones.

## Fontes verificadas e limitações

### Open-Meteo

Documentação: https://open-meteo.com/en/docs

Endpoint: `https://api.open-meteo.com/v1/forecast`. Requisição construída em `lib/weather/weatherApi.ts`, com `current`, `hourly`, `daily`, `past_days=2`, `forecast_days=7`, `timeformat=unixtime` e fuso explícito. Consulta direta bem-sucedida no navegador em 30/09/2026, validando acesso entre origens neste ambiente. Dados atuais/históricos são produtos de modelos e podem diferir de medições locais. A pressão mostrada é na superfície, não reduzida ao nível do mar. Precipitação atual e chuva horária têm intervalos distintos.

A modalidade gratuita é voltada a uso não comercial e sujeita aos limites publicados pelo fornecedor. Consulte https://open-meteo.com/en/terms antes de uso comercial. Atribuição visível no site. Não configure segredo no frontend: todas as variáveis `NEXT_PUBLIC_*` são públicas.

### RainViewer

Documentação: https://www.rainviewer.com/api/weather-maps-api.html

Mudanças atuais: https://www.rainviewer.com/api/transition-faq.html

Endpoint: `https://api.rainviewer.com/public/weather-maps.json`. HTTP 200 e `Access-Control-Allow-Origin: *` confirmados em 30/09/2026. O adaptador usa `host` e `path` recebidos, incluindo identificadores alfanuméricos presentes na resposta real; nunca calcula nomes de quadros. Tiles reais foram carregados no navegador.

API pública para uso pessoal/educacional: janela passada de duas horas em passos de aproximadamente dez minutos, zoom nativo máximo 7 e limite divulgado de 100 requisições/IP/minuto. Nowcast futuro e infravermelho de satélite foram descontinuados em 2026. Usa paleta 2 conforme URL documentada, sem prometer escala quantitativa em mm/h.

Tiles de 512 px com `zoomOffset=-1` reduzem requisições; animação muda a cada seis segundos. Zoom de mapa até 12 amplia os tiles disponíveis, sem acrescentar resolução de radar. Cache HTTP é controlado pelo provedor. Movimentos repetidos, controles rápidos ou vários usuários no mesmo IP ainda podem atingir limites externos. Não há download em massa nem prefetch.

Máscara escura identifica ausência de cobertura; a máscara pode não refletir interrupções recentes. Ausência de eco **não comprova ausência de chuva**. Timestamp refere-se ao quadro composto, não necessariamente à hora exata de cada radar. Atribuição RainViewer permanece visível.

### INPE / CPTEC

Fonte verificada: https://www.cptec.inpe.br/dsat/ (HTTP 200 em 30/09/2026). Integração por visualizador oficial, não por endpoint de imagens não documentado. O iframe depende de políticas de incorporação, disponibilidade e recursos do INPE; se bloqueado, use o link externo. Não se aplica CORS a uma navegação/iframe da mesma maneira que a `fetch`; CSP e X-Frame-Options podem impedir incorporação. Nenhum status de atualização é presumido para esse portal.

### INMET

https://portal.inmet.gov.br/ é apresentado como referência oficial para medições e avisos. Não foi validada nesta versão uma API documentada, estável e acessível por CORS que forneça medições locais. Portanto, **não há ingestão de dados INMET** e o status informa consulta ao portal, sem inventar uma estação ou valores.

### Mapa

Tiles de https://tile.openstreetmap.org/{z}/{x}/{y}.png, com atribuição aos colaboradores OpenStreetMap. Política: https://operations.osmfoundation.org/policies/tiles/. Não implementar download offline/prefetch desses tiles. Para tráfego elevado, escolher provedor apropriado.

## Organização e extensão

- `app/`: página, layout, estilos, manifest e metadata.
- `components/Dashboard.tsx`: composição e controles da interface.
- `components/radar/WeatherRadarMap.tsx`: mapa independente de RainViewer; recebe `RadarFrame` com `timestamp` e `tileUrl`, atribuição e máscara opcional.
- `lib/config/location.ts`: coordenadas, cidade, estado, país, fuso, zoom e intervalos.
- `lib/weather/weatherApi.ts`, `radarApi.ts`, `satelliteApi.ts`: fontes separadas; sem chamadas HTTP nos componentes visuais.
- `lib/weather/http.ts`: transporte com timeout; `hooks/useSource.ts`: ciclo independente de cada fonte.
- `types/`: contratos meteorológicos, radar e futura estação.

Para mudar a região dos dados e mapa, altere `lib/config/location.ts`. Textos editoriais e SEO que mencionam Pompeia devem ser revisados em `Dashboard.tsx` e `layout.tsx`. O aplicativo é de uma cidade nesta versão; não há seletor multi-cidade.

Para trocar radar, implemente um adaptador que retorne `Radar` em `types/radar.ts`. Para outra previsão, normalize a resposta para `Weather`, respeitando unidades e timestamps Unix, e substitua o fetcher de `useSource`. Para satélite, estenda `SatelliteSource` somente após verificar endpoint, permissões e CORS.

`StationReading` e `StationProvider` em `types/weather.ts` reservam campos/unidades para ESP32. Nenhuma estação está conectada. MQTT, banco, múltiplas estações, alertas e IA ficam para versões futuras. MQTT TCP não é consumível diretamente por este frontend; eventual integração exigirá infraestrutura externa apropriada, fora desta versão.

## Publicar no Cloudflare Pages

1. Conecte o repositório ao Pages.
2. Configure Node 22, comando `npm run build` e diretório de saída `out`.
3. Deixe `NEXT_PUBLIC_BASE_PATH` vazio para domínio raiz.
4. Publique como arquivos estáticos; não selecione Workers, SSR ou adaptador Next.js de servidor.

## Publicar no GitHub Pages

Workflow incluído em `.github/workflows/pages.yml`. Em Settings → Pages, selecione **GitHub Actions**. O workflow executa em `main` (ajuste se sua branch for diferente) e pode ser iniciado manualmente. Ele usa o `base_path` retornado por `configure-pages`, atendendo subdiretórios de repositórios, domínio raiz e domínio personalizado.

Para testar manualmente o subdiretório, em PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/Dev-s_Weather'
npm run build
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

Não coloque barra no final. Esse valor é aplicado na compilação; modificar após o build não altera os arquivos exportados. Para servir esse build localmente, coloque `out` sob uma pasta `/Dev-s_Weather` na raiz do servidor HTTP. O workflow publica apenas `out/`.

## Outras hospedagens

Netlify: build `npm run build`, publish `out`, sem functions. Azure Static Web Apps: saída `out`, sem diretório de API. Qualquer host de arquivos estáticos com HTTPS é suficiente.

## Validação

Verificações executadas durante a implementação: TypeScript, build de produção com exportação estática, consulta Open-Meteo no navegador, JSON e tiles RainViewer reais, navegação e inspeção responsiva. Falhas externas não são substituídas por dados demonstrativos. O resultado não é serviço de alertas; consulte os órgãos oficiais para avisos.

As condições e limites das fontes podem mudar. O painel informa falhas e mantém links oficiais; nenhuma hospedagem foi publicada automaticamente.
