const CFG = window.CATALOG_CONFIG || {};
const SAMPLE = [
  {Status:'Disponível', Nome:'Charizard ex', Numero:'199', Set:'Obsidian Flames', Raridade:'Special Illustration Rare', Variante:'SIR', Idioma:'Inglês', Condicao:'NM', Qtde:'1', Preco:'1250', URL_Imagem:'https://images.pokemontcg.io/sv3/223_hires.png', Observacoes:'Exemplo de preenchimento'},
  {Status:'Disponível', Nome:'Pikachu', Numero:'173', Set:'Crown Zenith', Raridade:'Secret Rare', Variante:'Secret', Idioma:'Inglês', Condicao:'NM', Qtde:'1', Preco:'450', URL_Imagem:'https://images.pokemontcg.io/swsh12pt5/160_hires.png', Observacoes:'Exemplo de catálogo'},
  {Status:'Reservado', Nome:'Gengar VMAX', Numero:'271', Set:'Fusion Strike', Raridade:'Rare Secret', Variante:'Alternate Art', Idioma:'Inglês', Condicao:'SP', Qtde:'1', Preco:'1800', URL_Imagem:'https://images.pokemontcg.io/swsh8/271_hires.png', Observacoes:'Pequeno whitening'}
];
let rows = [];
const BRL = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const $ = (id)=>document.getElementById(id);
function clean(v){return (v ?? '').toString().trim()}
function priceNumber(v){return Number(clean(v).replace(/[R$\s.]/g,'').replace(',','.')) || 0}
function isAvailable(r){return clean(r.Status).toLowerCase()==='disponível' || clean(r.Status).toLowerCase()==='disponivel'}
function imgOf(r){return clean(r.URL_Imagem || r.URLImagem || r.Imagem || r['URL Imagem'])}
function waLink(message){const phone = clean(CFG.WHATSAPP_NUMBER).replace(/\D/g,''); return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
async function loadRows(){
  const hasSheet = CFG.SHEET_ID && CFG.SHEET_ID !== 'COLE_AQUI_O_ID_DA_SUA_PLANILHA';
  if(!hasSheet){ rows = SAMPLE; render(); return; }
  const tab = encodeURIComponent(CFG.SHEET_TAB || 'ESTOQUE_MESTRE');
  const endpoint = `${CFG.OPENSHEET_BASE || 'https://opensheet.elk.sh'}/${CFG.SHEET_ID}/${tab}?raw=true`;
  try{ const res = await fetch(endpoint); if(!res.ok) throw new Error('Erro ao carregar planilha'); rows = await res.json(); rows = rows.filter(r=>clean(r.Nome)); await fillMissingImages(rows); render(); }
  catch(e){ console.warn(e); rows = SAMPLE; render('Não foi possível carregar sua planilha. Exibindo dados de exemplo.'); }
}
async function fillMissingImages(data){
  const todo = data.filter(r=>!imgOf(r) && clean(r.Nome)).slice(0,20);
  await Promise.all(todo.map(async r=>{ try{ const q=[]; q.push(`name:${clean(r.Nome).replace(/\s+/g,'* ')}*`); if(clean(r.Numero)) q.push(`number:${clean(r.Numero)}`); const url=`https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q.join(' '))}&select=id,name,number,set,rarity,images`; const j=await fetch(url).then(x=>x.json()); const c=(j.data||[])[0]; if(c){ r.URL_Imagem = c.images?.large || c.images?.small || ''; r.Set = r.Set || c.set?.name || ''; r.Raridade = r.Raridade || c.rarity || ''; } }catch{} }));
}
function render(warn=''){
  const query = clean($('search').value).toLowerCase();
  const status = $('statusFilter').value; const lang = $('languageFilter').value; const cond = $('conditionFilter').value; const sort = $('sortBy').value;
  populateFilters();
  let data = rows.filter(r=>clean(r.Nome));
  if(status !== 'Todos') data = data.filter(r=>clean(r.Status)===status || (status==='Disponível' && isAvailable(r)));
  if(lang !== 'Todos') data = data.filter(r=>clean(r.Idioma)===lang);
  if(cond !== 'Todos') data = data.filter(r=>clean(r.Condicao || r['Condição'])===cond);
  if(query) data = data.filter(r=>Object.values(r).join(' ').toLowerCase().includes(query));
  data.sort((a,b)=> sort==='preco-asc'? priceNumber(a.Preco)-priceNumber(b.Preco) : sort==='preco-desc'? priceNumber(b.Preco)-priceNumber(a.Preco) : sort==='set'? clean(a.Set).localeCompare(clean(b.Set),'pt-BR') : clean(a.Nome).localeCompare(clean(b.Nome),'pt-BR'));
  renderSummary(data,warn); renderCards(data); $('empty').hidden = data.length>0;
}
function renderSummary(data,warn=''){
  const disp = rows.filter(isAvailable).length; const total = rows.filter(r=>clean(r.Nome)).length; const valor = rows.filter(isAvailable).reduce((s,r)=>s+priceNumber(r.Preco)*(Number(r.Qtde)||1),0);
  $('summary').innerHTML = `${warn?`<div class="kpi" style="grid-column:1/-1"><span>Aviso</span><strong style="font-size:16px">${warn}</strong></div>`:''}<div class="kpi"><span>Itens exibidos</span><strong>${data.length}</strong></div><div class="kpi"><span>Disponíveis</span><strong>${disp}</strong></div><div class="kpi"><span>Total cadastradas</span><strong>${total}</strong></div><div class="kpi"><span>Valor disponível</span><strong>${BRL.format(valor)}</strong></div>`;
  const list = data.filter(isAvailable).slice(0,25).map(r=>`${clean(r.Nome)} #${clean(r.Numero)} - ${BRL.format(priceNumber(r.Preco))}`).join('\n');
  $('whatsAll').href = waLink(`Olá! Tenho interesse nestas cartas Pokémon TCG:\n\n${list}`);
}
function renderCards(data){
  $('catalog').innerHTML = data.map(r=>{
    const cond = clean(r.Condicao || r['Condição']); const status = clean(r.Status) || 'Disponível'; const available = isAvailable(r); const reserve = status==='Reservado';
    const msg = `Olá! Tenho interesse na carta ${clean(r.Nome)} #${clean(r.Numero)} (${clean(r.Set)}), ${clean(r.Idioma)}, condição ${cond}, preço ${BRL.format(priceNumber(r.Preco))}.`;
    return `<article class="card"><span class="ribbon ${available?'':reserve?'reserved':'sold'}">${status}</span><div class="imageWrap"><img loading="lazy" src="${imgOf(r)||'assets/card-placeholder.svg'}" alt="${clean(r.Nome)}"></div><div class="cardBody"><h2>${clean(r.Nome)}</h2><p class="meta">Nº ${clean(r.Numero)||'-'} • ${clean(r.Set)||'Coleção não informada'}</p><div class="price">${BRL.format(priceNumber(r.Preco))}</div><div class="tags"><span class="tag">${clean(r.Idioma)||'Idioma não informado'}</span><span class="tag tag--green">${cond||'Condição não informada'}</span>${clean(r.Variante)?`<span class="tag">${clean(r.Variante)}</span>`:''}${clean(r.Observacoes)?`<span class="tag tag--red">${clean(r.Observacoes)}</span>`:''}</div>${available?`<a class="whats no-print" target="_blank" rel="noreferrer" href="${waLink(msg)}">Comprar via WhatsApp</a>`:''}</div></article>`;
  }).join('');
}
function populateFilters(){
  const fill = (id, values)=>{const el=$(id); const current=el.value; const opts=['Todos',...Array.from(new Set(values.filter(Boolean))).sort((a,b)=>a.localeCompare(b,'pt-BR'))]; el.innerHTML=opts.map(v=>`<option value="${v}">${v}</option>`).join(''); if(opts.includes(current)) el.value=current;};
  fill('languageFilter', rows.map(r=>clean(r.Idioma))); fill('conditionFilter', rows.map(r=>clean(r.Condicao || r['Condição'])));
}
['search','statusFilter','languageFilter','conditionFilter','sortBy'].forEach(id=>$(id).addEventListener('input',()=>render()));
$('printBtn').addEventListener('click',()=>window.print());
loadRows();
