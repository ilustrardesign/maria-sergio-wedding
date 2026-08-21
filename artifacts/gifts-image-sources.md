# Gift image sources

Fonte principal: https://noivos.casar.com/maria-e-sergio-2026-10-31

Método de recuperação:
- Chrome DevTools/CDP na página pública antiga.
- Scroll completo da lista.
- Leitura do DOM renderizado e do modelo Angular `giftsController.vm.gifts`.
- URL local baixada da CDN pública do Casar.com, sem hotlink em produção.

Observação de pareamento:
- A lista atual em `src/content/wedding.ts` continua sendo a fonte de verdade para ID, título, preço e ordem.
- A página antiga foi usada como fonte de verdade para imagem.
- O item 14 aparece na página antiga como "Maracujina para os noivos ficarem tranquilos", pareado por preço e similaridade ao título atual "Maracujá para os noivos ficarem tranquilos".

## Assets

### 01
Presente: Ajuda para a aposentadoria dos noivos
Arquivo local: `public/images/gifts/original/01-aposentadoria.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/IDjG7_1779836016.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 02
Presente: Aluguel de um bebê para treinamento
Arquivo local: `public/images/gifts/original/02-aluguel-bebe.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/img/presentes/bebe.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, imagem de catálogo Casar.com.

### 03
Presente: Assaltar o frigobar na lua de mel
Arquivo local: `public/images/gifts/original/03-frigobar-lua-de-mel.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/xOus1_1782067450.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 04
Presente: Cobertor para a noiva que está sempre coberta de razão
Arquivo local: `public/images/gifts/original/04-cobertor-razao.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/Fc7PZ_1779832300.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 05
Presente: Conjunto de controle remotos para não ter briga
Arquivo local: `public/images/gifts/original/05-controles-remotos.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/Fp6Ve_1782068046.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 06
Presente: Cota do ar condicionado pra não derreter nesse calor
Arquivo local: `public/images/gifts/original/06-ar-condicionado.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/VnHY8_1779831199.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 07
Presente: Cota para perguntar quando teremos filhos
Arquivo local: `public/images/gifts/original/07-quando-teremos-filhos.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/EQki6_1779831060.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 08
Presente: Deus abençoou e você vai dar a geladeira
Arquivo local: `public/images/gifts/original/08-geladeira.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/8mROA_1779835689.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 09
Presente: Garanta o jantar do noivo durante o 1º mês de casado
Arquivo local: `public/images/gifts/original/09-jantar-noivo.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/1iRJz_1782067257.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 10
Presente: Garantir o primeiro lugar na fila do buffet
Arquivo local: `public/images/gifts/original/10-fila-buffet.jpg`
Fonte original auditada: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original auditada com watermark: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/41hPc_1779837698.jpg
Fonte substituta: Wikimedia Commons, `Buffet line at Todai.jpg`
URL da fonte substituta: https://commons.wikimedia.org/wiki/File:Buffet_line_at_Todai.jpg
Autor: inazakira
Licença: CC BY-SA 2.0
Método de recuperação: a imagem da página antiga e do PDF continha watermark visível `iStock`; substituída pontualmente por alternativa equivalente de buffet com licença compatível.

### 11
Presente: Jogo de panelas para Sérgio sempre fazer o jantar
Arquivo local: `public/images/gifts/original/11-panelas-sergio.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/Am1Bx_1779832796.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 12
Presente: Lava e seca pra não ter briga de quem estende a roupa
Arquivo local: `public/images/gifts/original/12-lava-seca.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/ivPP6_1779830768.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 13
Presente: Lenço para a noiva não borrar toda a maquiagem
Arquivo local: `public/images/gifts/original/13-lenco-maquiagem.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/img/presentes/lenco_noiva_chorando.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, imagem de catálogo Casar.com.

### 14
Presente: Maracujá para os noivos ficarem tranquilos
Arquivo local: `public/images/gifts/original/14-maracuja.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/img/presentes/maracuja.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, imagem de catálogo Casar.com.

### 15
Presente: Menos uma parcela no financiamento do AP
Arquivo local: `public/images/gifts/original/15-financiamento-ap.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/zJ5Ld_1779832636.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 16
Presente: Passeio na lua de mel
Arquivo local: `public/images/gifts/original/16-passeio-lua-de-mel.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/H4CYk_1779836882.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 17
Presente: Patrocine a despedida da noiva
Arquivo local: `public/images/gifts/original/17-despedida-noiva.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/img/presentes/despedida_de_solteira.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, imagem de catálogo Casar.com.

### 18
Presente: Patrocine a despedida do noivo
Arquivo local: `public/images/gifts/original/18-despedida-noivo.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/img/presentes/se_beber_nao_case.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, imagem de catálogo Casar.com.

### 19
Presente: Poder ir junto com os noivos para a lua de mel
Arquivo local: `public/images/gifts/original/19-ir-junto-lua-de-mel.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/img/presentes/segurando_vela.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, imagem de catálogo Casar.com.

### 20
Presente: Presentão para os noivos
Arquivo local: `public/images/gifts/original/20-presentao.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/noln7_1779836664.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 21
Presente: Prioridade no quarto de visita na casa dos noivos
Arquivo local: `public/images/gifts/original/21-quarto-visita.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/img/presentes/quarto_de_visita.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, imagem de catálogo Casar.com.

### 22
Presente: Relógio para a noiva parar de se atrasar
Arquivo local: `public/images/gifts/original/22-relogio-noiva.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/Hi2zq_1779836984.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 23
Presente: Tampão de ouvido pra noiva enquanto noivo ronca
Arquivo local: `public/images/gifts/original/23-tampao-ronco.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/dados/sitenoivos/wed1338611/presentes/RwX0j_1779835973.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, `img_user=1`, CDN Casar.com.

### 24
Presente: Taxa pra noiva jogar o buquê na sua direção
Arquivo local: `public/images/gifts/original/24-buque-direcao.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/img/presentes/noiva_jogando_buque.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, imagem de catálogo Casar.com.

### 25
Presente: Um ano de cabelo cortado para o noivo
Arquivo local: `public/images/gifts/original/25-cabelo-noivo.jpg`
Fonte: https://noivos.casar.com/maria-e-sergio-2026-10-31
URL original da imagem/CDN: https://cdn-assets-legacy.casar.com/thumb/600x600x1/img/presentes/barbearia.jpg
Método de recuperação: modelo Angular `giftsController.vm.gifts`, imagem de catálogo Casar.com.

### 26
Presente: Não achou o presente perfeito?
Arquivo local: `public/images/gifts/original/26-valor-livre.svg`
Fonte: composição local criada para a exceção de valor livre.
URL original da imagem/CDN: N/A
Método de recuperação: item não existia na lista antiga; exceção autorizada para composição editorial própria.
