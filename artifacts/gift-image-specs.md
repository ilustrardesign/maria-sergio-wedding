# Gift Image Specs

Inventário das imagens usadas por `src/components/sections/GiftsSection.tsx`. Os arquivos podem ser substituídos mantendo exatamente os mesmos nomes e paths.

## Padrão do container

- Referência: `src/components/sections/EditorialSections.module.css`, `.giftImage`, `.giftImage img`, `.giftItem`.
- Comportamento atual: container quadrado; `object-fit: cover` por padrão; `object-position: center` por padrão. Itens com `imageFit` ou `imagePosition` sobrescrevem esses valores via variáveis CSS no componente.
- Padrão recomendado para novas fotos: `1200 x 1200 px`, proporção `1:1`, JPEG sRGB, qualidade 82–88, sem transparência. Isso evita cortes diferentes entre cards e mantém nitidez em telas retina.
- O presente 10 é atualmente 4:3 e sofre crop no container quadrado. Recomenda-se entregar uma versão quadrada para padronização.

## Inventário

| ID | Título | Arquivo, dimensão, proporção, formato, bytes | Referência | Ajuste atual | Nova imagem recomendada | Nome final |
|---|---|---|---|---|---|---|
| aposentadoria | Ajuda para a aposentadoria dos noivos | `public/images/gifts/original/01-aposentadoria.jpg`, 600x600, 1:1, JPEG, 69,297 | `wedding.ts:243` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `01-aposentadoria.jpg` |
| bebe | Aluguel de um bebê para treinamento | `public/images/gifts/original/02-aluguel-bebe.jpg`, 600x600, 1:1, JPEG, 43,354 | `wedding.ts:244` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `02-aluguel-bebe.jpg` |
| frigobar | Assaltar o frigobar na lua de mel | `public/images/gifts/original/03-frigobar-lua-de-mel.jpg`, 600x600, 1:1, JPEG, 78,561 | `wedding.ts:245` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `03-frigobar-lua-de-mel.jpg` |
| cobertor | Cobertor para a noiva que está sempre coberta de razão | `public/images/gifts/original/04-cobertor-razao.jpg`, 600x600, 1:1, JPEG, 56,076 | `wedding.ts:246` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `04-cobertor-razao.jpg` |
| controles | Conjunto de controles remotos para não ter briga | `public/images/gifts/original/05-controles-remotos.jpg`, 600x600, 1:1, JPEG, 79,120 | `wedding.ts:247` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `05-controles-remotos.jpg` |
| ar-condicionado | Cota do ar condicionado pra não derreter nesse calor | `public/images/gifts/original/06-ar-condicionado.jpg`, 600x600, 1:1, JPEG, 58,401 | `wedding.ts:248` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `06-ar-condicionado.jpg` |
| filhos | Cota para perguntar quando teremos filhos | `public/images/gifts/original/07-quando-teremos-filhos.jpg`, 600x600, 1:1, JPEG, 55,844 | `wedding.ts:249` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `07-quando-teremos-filhos.jpg` |
| geladeira | Deus abençoou e você vai dar a geladeira | `public/images/gifts/original/08-geladeira.jpg`, 600x600, 1:1, JPEG, 51,960 | `wedding.ts:250` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `08-geladeira.jpg` |
| jantar-noivo | Garanta o jantar do noivo durante o 1º mês de casado | `public/images/gifts/original/09-jantar-noivo.jpg`, 600x600, 1:1, JPEG, 73,326 | `wedding.ts:251` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `09-jantar-noivo.jpg` |
| buffet | Garantir o primeiro lugar na fila do buffet | `public/images/gifts/original/10-fila-buffet.jpg`, 960x720, 4:3, JPEG, 148,899 | `wedding.ts:252` | cover, center, crop quadrado | 1200x1200, 1:1, JPEG q82–88 | `10-fila-buffet.jpg` |
| panelas | Jogo de panelas para Sérgio sempre fazer o jantar | `public/images/gifts/original/11-panelas-sergio.jpg`, 600x600, 1:1, JPEG, 50,645 | `wedding.ts:253` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `11-panelas-sergio.jpg` |
| lava-seca | Lava e seca pra não ter briga de quem estende a roupa | `public/images/gifts/original/12-lava-seca.jpg`, 600x600, 1:1, JPEG, 64,837 | `wedding.ts:254` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `12-lava-seca.jpg` |
| maquiagem | Lenço para a noiva não borrar toda a maquiagem | `public/images/gifts/original/13-lenco-maquiagem.jpg`, 600x600, 1:1, JPEG, 72,649 | `wedding.ts:255` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `13-lenco-maquiagem.jpg` |
| maracuja | Maracujá para os noivos ficarem tranquilos | `public/images/gifts/original/14-maracuja.jpg`, 600x600, 1:1, JPEG, 85,255 | `wedding.ts:256` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `14-maracuja.jpg` |
| financiamento | Menos uma parcela no financiamento do AP | `public/images/gifts/original/15-financiamento-ap.jpg`, 600x600, 1:1, JPEG, 57,228 | `wedding.ts:257` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `15-financiamento-ap.jpg` |
| passeio | Passeio na lua de mel | `public/images/gifts/original/16-passeio-lua-de-mel.jpg`, 600x600, 1:1, JPEG, 67,105 | `wedding.ts:258` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `16-passeio-lua-de-mel.jpg` |
| despedida-noiva | Patrocine a despedida da noiva | `public/images/gifts/original/17-despedida-noiva.jpg`, 600x600, 1:1, JPEG, 39,867 | `wedding.ts:259` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `17-despedida-noiva.jpg` |
| despedida-noivo | Patrocine a despedida do noivo | `public/images/gifts/original/18-despedida-noivo.jpg`, 600x600, 1:1, JPEG, 98,388 | `wedding.ts:260` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `18-despedida-noivo.jpg` |
| ir-junto | Poder ir junto com os noivos para a lua de mel | `public/images/gifts/original/19-ir-junto-lua-de-mel.jpg`, 600x600, 1:1, JPEG, 65,981 | `wedding.ts:261` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `19-ir-junto-lua-de-mel.jpg` |
| presenteao | Presentão para os noivos | `public/images/gifts/original/20-presentao.jpg`, 600x600, 1:1, JPEG, 63,142 | `wedding.ts:262` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `20-presentao.jpg` |
| quarto-visita | Prioridade no quarto de visita na casa dos noivos | `public/images/gifts/original/21-quarto-visita.jpg`, 600x600, 1:1, JPEG, 66,283 | `wedding.ts:263` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `21-quarto-visita.jpg` |
| relogio | Relógio para a noiva parar de se atrasar | `public/images/gifts/original/22-relogio-noiva.jpg`, 600x600, 1:1, JPEG, 59,332 | `wedding.ts:264` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `22-relogio-noiva.jpg` |
| tampao | Tampão de ouvido pra noiva enquanto noivo ronca | `public/images/gifts/original/23-tampao-ronco.jpg`, 600x600, 1:1, JPEG, 65,301 | `wedding.ts:265` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `23-tampao-ronco.jpg` |
| buque | Taxa pra noiva jogar o buquê na sua direção | `public/images/gifts/original/24-buque-direcao.jpg`, 600x600, 1:1, JPEG, 64,365 | `wedding.ts:266` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `24-buque-direcao.jpg` |
| cabelo | Um ano de cabelo cortado para o noivo | `public/images/gifts/original/25-cabelo-noivo.jpg`, 600x600, 1:1, JPEG, 108,266 | `wedding.ts:267` | cover, center | 1200x1200, 1:1, JPEG q82–88 | `25-cabelo-noivo.jpg` |
| valor-livre | Não achou o presente perfeito? | `public/images/gifts/original/26-valor-livre.svg`, 600x600, 1:1, SVG, 1,412 | `wedding.ts:268` | contain, center | manter vetor quadrado; SVG otimizado, ou PNG 1200x1200 se necessário | `26-valor-livre.svg` |

## Workflow de substituição

1. Edite cada imagem nova em 1200x1200 px, mantendo o assunto principal dentro da área central segura.
2. Exporte em JPEG sRGB, qualidade 82–88, substituindo o arquivo com o mesmo nome em `public/images/gifts/original/`.
3. Para `26-valor-livre.svg`, preserve o nome e a transparência; não converta para JPEG.
4. Atualize o localhost e faça refresh. Nenhuma alteração em `wedding.ts` é necessária quando o nome e o path forem preservados.
