# Catálogo Pokémon TCG - Google Sheets + GitHub Pages

Projeto pronto para publicar um catálogo de cartas Pokémon TCG em formato de folder premium, alimentado por Google Sheets.

## Tecnologias usadas

- Google Sheets como estoque mestre.
- OpenSheet para ler a planilha como JSON público.
- Pokémon TCG API para preencher imagens quando a coluna `URL_Imagem` estiver vazia.
- GitHub Pages para hospedagem estática.
- WhatsApp integrado por carta e por lista.
- PDF automático via `window.print()` com CSS de impressão.

## Arquivos

- `index.html`: vitrine pública.
- `styles.css`: layout premium estilo folder.
- `app.js`: leitura da planilha, filtros, WhatsApp, PDF e fallback de imagem.
- `config.js`: configuração do ID da planilha e WhatsApp.
- `admin.html`: ferramenta simples para buscar e validar imagens.
- `estoque_mestre_modelo.xlsx`: modelo para montar a planilha no Google Sheets.
- `estoque_mestre_modelo.csv`: alternativa para importar rapidamente no Google Sheets.
- `google-apps-script/Code.gs`: opcional, para criar menu no Google Sheets que busca a imagem da linha ativa.

## Como configurar

1. Crie uma planilha no Google Sheets.
2. Importe `estoque_mestre_modelo.xlsx` ou `estoque_mestre_modelo.csv`.
3. Renomeie a aba principal para `ESTOQUE_MESTRE`.
4. Compartilhe a planilha como: qualquer pessoa com o link pode visualizar.
5. Copie o ID da planilha na URL.
6. Edite o arquivo `config.js`:

```js
SHEET_ID: 'COLE_AQUI_O_ID_DA_SUA_PLANILHA',
WHATSAPP_NUMBER: '5561999999999'
```

7. Publique os arquivos em um repositório no GitHub.
8. Ative GitHub Pages em Settings > Pages > Deploy from branch > main > root.

## Colunas esperadas na aba ESTOQUE_MESTRE

- ID
- Status
- Nome
- Numero
- Set
- Raridade
- Variante
- Idioma
- Condicao
- Qtde
- Preco
- URL_Imagem
- Observacoes
- Atualizado_Em

## Status recomendados

- Disponível
- Reservado
- Vendido

## Condições recomendadas

- NM
- SP
- MP
- HP
- DMG

## Observações práticas

- Se `URL_Imagem` estiver preenchida, o site usa essa imagem.
- Se `URL_Imagem` estiver vazia, o site tenta buscar automaticamente pela Pokémon TCG API usando `Nome` e `Numero`. Esse preenchimento é visual no site e não grava na planilha.
- Para gravar a URL na planilha, use `admin.html` e copie a URL validada para a coluna `URL_Imagem`, ou use o script opcional do Google Apps Script.
- O botão Gerar PDF usa o recurso de impressão do navegador. Escolha “Salvar como PDF”.
