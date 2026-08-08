function onOpen() {
  SpreadsheetApp.getUi().createMenu('Pokémon TCG')
    .addItem('Buscar imagem da linha ativa', 'buscarImagemLinhaAtiva')
    .addToUi();
}

function buscarImagemLinhaAtiva() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('ESTOQUE_MESTRE');
  const row = sheet.getActiveRange().getRow();
  if (row <= 1) return;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idx = name => headers.indexOf(name) + 1;
  const nome = sheet.getRange(row, idx('Nome')).getValue();
  const numero = sheet.getRange(row, idx('Numero')).getValue();
  const q = [];
  if (nome) q.push('name:' + String(nome).replace(/\s+/g, '* ') + '*');
  if (numero) q.push('number:' + numero);
  const url = 'https://api.pokemontcg.io/v2/cards?q=' + encodeURIComponent(q.join(' ')) + '&select=id,name,number,set,rarity,images';
  const res = UrlFetchApp.fetch(url);
  const data = JSON.parse(res.getContentText()).data || [];
  if (!data.length) {
    SpreadsheetApp.getUi().alert('Nenhuma carta encontrada. Tente ajustar Nome e Numero.');
    return;
  }
  const card = data[0];
  if (idx('URL_Imagem')) sheet.getRange(row, idx('URL_Imagem')).setValue(card.images.large || card.images.small || '');
  if (idx('Set') && !sheet.getRange(row, idx('Set')).getValue()) sheet.getRange(row, idx('Set')).setValue(card.set.name || '');
  if (idx('Raridade') && !sheet.getRange(row, idx('Raridade')).getValue()) sheet.getRange(row, idx('Raridade')).setValue(card.rarity || '');
  SpreadsheetApp.getUi().alert('Imagem preenchida com a primeira opção encontrada. Confira visualmente antes de publicar.');
}
