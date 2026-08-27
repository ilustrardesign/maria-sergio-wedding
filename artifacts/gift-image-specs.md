# Gift Image Specs

Inventário das 26 imagens usadas por `GiftsSection`. Nenhuma foto é substituída neste passe.

## Como substituir uma foto

1. Prepare/baixe um JPEG horizontal em aproximadamente 3:2.
2. Prefira 2000×1332 ou 2000×1333 (1800×1200 também funciona).
3. Renomeie exatamente para o filename listado e substitua-o em `public/images/gifts/original/`.
4. Mantenha a extensão, JPEG sRGB, qualidade 82–88; atualize o localhost e confira o crop.
5. Se necessário, ajuste somente `object-position` no código.

## Padrão geral

- Aspect ratio: 3:2
- Recommended: 2000×1333
- Accepted current source: 2000×1332
- JPEG, sRGB, quality 82–88; target aproximado 250–700 KB
- `object-fit: cover`; `object-position: center` por padrão
- O item 26 permanece SVG e usa `contain`.

## Pipeline de otimização

Os JPEGs em `public/images/gifts/original/` são os masters preservados. O comando `pnpm generate:gift-images` usa Sharp para gerar variantes WebP responsivas (quality 82, sem lossless/upscale) em `public/images/gifts/generated/`, além do manifest regenerável `src/generated/gift-images.ts`. `GiftsSection` transforma esse manifest em `<picture>`/`<img>` com `srcset`, `sizes`, `width`, `height`, `loading="lazy"` e `decoding="async"`; o navegador escolhe diretamente o asset estático apropriado, sem `/_next/image`.

## Como substituir uma imagem no futuro

1. Substitua o JPEG master mantendo exatamente o nome em `public/images/gifts/original/`.
2. Execute `pnpm generate:gift-images`.
3. Confira os WebP derivados e inicie `pnpm dev` para verificar o crop.
4. Faça commit do master, derivados e manifest gerado conforme a estratégia do repositório.

O `build` executa a geração automaticamente (`pnpm build`), mas o desenvolvimento local usa o comando explícito acima para regenerar somente quando uma foto mudar.

## Catálogo

Cada item abaixo preserva ID, filename, path, dimensão/formato/bytes atuais, referência, overrides e nome final.

### 01 — aposentadoria

- ID / título: `aposentadoria` — Ajuda para a aposentadoria dos noivos
- Arquivo / path: `01-aposentadoria.jpg` — `public/images/gifts/original/01-aposentadoria.jpg`
- Atual: 600×600 · 1:1 · JPEG · 69,297 B · `wedding.ts` item 01
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `01-aposentadoria.jpg`

### 02 — bebe

- ID / título: `bebe` — Aluguel de um bebê para treinamento
- Arquivo / path: `02-aluguel-bebe.jpg` — `public/images/gifts/original/02-aluguel-bebe.jpg`
- Atual: 600×600 · 1:1 · JPEG · 43,354 B · `wedding.ts` item 02
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `02-aluguel-bebe.jpg`

### 03 — frigobar

- ID / título: `frigobar` — Assaltar o frigobar na lua de mel
- Arquivo / path: `03-frigobar-lua-de-mel.jpg` — `public/images/gifts/original/03-frigobar-lua-de-mel.jpg`
- Atual: 600×600 · 1:1 · JPEG · 78,561 B · `wedding.ts` item 03
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `03-frigobar-lua-de-mel.jpg`

### 04 — cobertor

- ID / título: `cobertor` — Cobertor para a noiva que está sempre coberta de razão
- Arquivo / path: `04-cobertor-razao.jpg` — `public/images/gifts/original/04-cobertor-razao.jpg`
- Atual: 600×600 · 1:1 · JPEG · 56,076 B · `wedding.ts` item 04
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `04-cobertor-razao.jpg`

### 05 — controles

- ID / título: `controles` — Conjunto de controles remotos para não ter briga
- Arquivo / path: `05-controles-remotos.jpg` — `public/images/gifts/original/05-controles-remotos.jpg`
- Atual: 600×600 · 1:1 · JPEG · 79,120 B · `wedding.ts` item 05
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `05-controles-remotos.jpg`

### 06 — ar-condicionado

- ID / título: `ar-condicionado` — Cota do ar condicionado pra não derreter nesse calor
- Arquivo / path: `06-ar-condicionado.jpg` — `public/images/gifts/original/06-ar-condicionado.jpg`
- Atual: 600×600 · 1:1 · JPEG · 58,401 B · `wedding.ts` item 06
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `06-ar-condicionado.jpg`

### 07 — filhos

- ID / título: `filhos` — Cota para perguntar quando teremos filhos
- Arquivo / path: `07-quando-teremos-filhos.jpg` — `public/images/gifts/original/07-quando-teremos-filhos.jpg`
- Atual: 600×600 · 1:1 · JPEG · 55,844 B · `wedding.ts` item 07
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `07-quando-teremos-filhos.jpg`

### 08 — geladeira

- ID / título: `geladeira` — Deus abençoou e você vai dar a geladeira
- Arquivo / path: `08-geladeira.jpg` — `public/images/gifts/original/08-geladeira.jpg`
- Atual: 600×600 · 1:1 · JPEG · 51,960 B · `wedding.ts` item 08
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `08-geladeira.jpg`

### 09 — jantar-noivo

- ID / título: `jantar-noivo` — Garanta o jantar do noivo durante o 1º mês de casado
- Arquivo / path: `09-jantar-noivo.jpg` — `public/images/gifts/original/09-jantar-noivo.jpg`
- Atual: 600×600 · 1:1 · JPEG · 73,326 B · `wedding.ts` item 09
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `09-jantar-noivo.jpg`

### 10 — buffet

- ID / título: `buffet` — Garantir o primeiro lugar na fila do buffet
- Arquivo / path: `10-fila-buffet.jpg` — `public/images/gifts/original/10-fila-buffet.jpg`
- Atual: 960×720 · 4:3 · JPEG · 148,899 B · `wedding.ts` item 10
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `10-fila-buffet.jpg`

### 11 — panelas

- ID / título: `panelas` — Jogo de panelas para Sérgio sempre fazer o jantar
- Arquivo / path: `11-panelas-sergio.jpg` — `public/images/gifts/original/11-panelas-sergio.jpg`
- Atual: 600×600 · 1:1 · JPEG · 50,645 B · `wedding.ts` item 11
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `11-panelas-sergio.jpg`

### 12 — lava-seca

- ID / título: `lava-seca` — Lava e seca pra não ter briga de quem estende a roupa
- Arquivo / path: `12-lava-seca.jpg` — `public/images/gifts/original/12-lava-seca.jpg`
- Atual: 600×600 · 1:1 · JPEG · 64,837 B · `wedding.ts` item 12
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `12-lava-seca.jpg`

### 13 — maquiagem

- ID / título: `maquiagem` — Lenço para a noiva não borrar toda a maquiagem
- Arquivo / path: `13-lenco-maquiagem.jpg` — `public/images/gifts/original/13-lenco-maquiagem.jpg`
- Atual: 600×600 · 1:1 · JPEG · 72,649 B · `wedding.ts` item 13
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `13-lenco-maquiagem.jpg`

### 14 — maracuja

- ID / título: `maracuja` — Maracujá para os noivos ficarem tranquilos
- Arquivo / path: `14-maracuja.jpg` — `public/images/gifts/original/14-maracuja.jpg`
- Atual: 600×600 · 1:1 · JPEG · 85,255 B · `wedding.ts` item 14
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `14-maracuja.jpg`

### 15 — financiamento

- ID / título: `financiamento` — Menos uma parcela no financiamento do AP
- Arquivo / path: `15-financiamento-ap.jpg` — `public/images/gifts/original/15-financiamento-ap.jpg`
- Atual: 600×600 · 1:1 · JPEG · 57,228 B · `wedding.ts` item 15
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `15-financiamento-ap.jpg`

### 16 — passeio

- ID / título: `passeio` — Passeio na lua de mel
- Arquivo / path: `16-passeio-lua-de-mel.jpg` — `public/images/gifts/original/16-passeio-lua-de-mel.jpg`
- Atual: 600×600 · 1:1 · JPEG · 67,105 B · `wedding.ts` item 16
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `16-passeio-lua-de-mel.jpg`

### 17 — despedida-noiva

- ID / título: `despedida-noiva` — Patrocine a despedida da noiva
- Arquivo / path: `17-despedida-noiva.jpg` — `public/images/gifts/original/17-despedida-noiva.jpg`
- Atual: 600×600 · 1:1 · JPEG · 39,867 B · `wedding.ts` item 17
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `17-despedida-noiva.jpg`

### 18 — despedida-noivo

- ID / título: `despedida-noivo` — Patrocine a despedida do noivo
- Arquivo / path: `18-despedida-noivo.jpg` — `public/images/gifts/original/18-despedida-noivo.jpg`
- Atual: 600×600 · 1:1 · JPEG · 98,388 B · `wedding.ts` item 18
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `18-despedida-noivo.jpg`

### 19 — ir-junto

- ID / título: `ir-junto` — Poder ir junto com os noivos para a lua de mel
- Arquivo / path: `19-ir-junto-lua-de-mel.jpg` — `public/images/gifts/original/19-ir-junto-lua-de-mel.jpg`
- Atual: 600×600 · 1:1 · JPEG · 65,981 B · `wedding.ts` item 19
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `19-ir-junto-lua-de-mel.jpg`

### 20 — presenteao

- ID / título: `presenteao` — Presentão para os noivos
- Arquivo / path: `20-presentao.jpg` — `public/images/gifts/original/20-presentao.jpg`
- Atual: 600×600 · 1:1 · JPEG · 63,142 B · `wedding.ts` item 20
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `20-presentao.jpg`

### 21 — quarto-visita

- ID / título: `quarto-visita` — Prioridade no quarto de visita na casa dos noivos
- Arquivo / path: `21-quarto-visita.jpg` — `public/images/gifts/original/21-quarto-visita.jpg`
- Atual: 600×600 · 1:1 · JPEG · 66,283 B · `wedding.ts` item 21
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `21-quarto-visita.jpg`

### 22 — relogio

- ID / título: `relogio` — Relógio para a noiva parar de se atrasar
- Arquivo / path: `22-relogio-noiva.jpg` — `public/images/gifts/original/22-relogio-noiva.jpg`
- Atual: 600×600 · 1:1 · JPEG · 59,332 B · `wedding.ts` item 22
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `22-relogio-noiva.jpg`

### 23 — tampao

- ID / título: `tampao` — Tampão de ouvido pra noiva enquanto noivo ronca
- Arquivo / path: `23-tampao-ronco.jpg` — `public/images/gifts/original/23-tampao-ronco.jpg`
- Atual: 600×600 · 1:1 · JPEG · 65,301 B · `wedding.ts` item 23
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `23-tampao-ronco.jpg`

### 24 — buque

- ID / título: `buque` — Taxa pra noiva jogar o buquê na sua direção
- Arquivo / path: `24-buque-direcao.jpg` — `public/images/gifts/original/24-buque-direcao.jpg`
- Atual: 600×600 · 1:1 · JPEG · 64,365 B · `wedding.ts` item 24
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `24-buque-direcao.jpg`

### 25 — cabelo

- ID / título: `cabelo` — Um ano de cabelo cortado para o noivo
- Arquivo / path: `25-cabelo-noivo.jpg` — `public/images/gifts/original/25-cabelo-noivo.jpg`
- Atual: 600×600 · 1:1 · JPEG · 108,266 B · `wedding.ts` item 25
- object-fit / object-position: `cover` / `center`
- Nova dimensão / nome final: 2000×1333 · `25-cabelo-noivo.jpg`

### 26 — valor-livre

- ID / título: `valor-livre` — Não achou o presente perfeito?
- Arquivo / path: `26-valor-livre.svg` — `public/images/gifts/original/26-valor-livre.svg`
- Atual: 600×600 · SVG · 1,711 B · `wedding.ts` item 26
- object-fit / object-position: `contain` / `center`
- Nova dimensão / nome final: manter SVG quadrado (ou PNG transparente 1200×1200) · `26-valor-livre.svg`
