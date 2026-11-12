'use strict';
const Core=ENLUMOSimulatorCore;
const sources={front:'photo-front.webp',back:'photo-back.webp',pinky:'photo-pinky.webp',thumb:'photo-thumb.webp'};
const defaults={body:'#eee8dc',lace:'#d4af37'};
let face='front',zoom=1,colors={...defaults},cache={},ready=false,threadColor='#76513b',nextId=1;
const fontList=[
 ['mincho','明朝体・上品','"Yu Mincho","Noto Serif JP",serif'],
 ['gothic','ゴシック体','"Yu Gothic","Meiryo",sans-serif'],
 ['rounded','丸ゴシック体','"Hiragino Maru Gothic ProN","Arial Rounded MT Bold",sans-serif'],
 ['yuji-syuku','書家風・優雅','"Yuji Syuku",serif'],
 ['yuji-boku','筆文字・太め','"Yuji Boku",serif'],
 ['yuji-mai','筆文字・流れる線','"Yuji Mai",serif'],
 ['shippori','クラシック明朝','"Shippori Mincho",serif'],
 ['shippori-b1','力強い明朝','"Shippori Mincho B1",serif'],
 ['zen-old','伝統的な明朝','"Zen Old Mincho",serif'],
 ['kaisei','装飾明朝','"Kaisei Decol",serif'],
 ['klee','手書き・やわらか','"Klee One",cursive'],
 ['kurenaido','手書き・細字','"Zen Kurenaido",cursive'],
 ['yusei','手書き・太字','"Yusei Magic",cursive'],
 ['english-script','英字筆記体','"Brush Script MT","Segoe Script",cursive'],
 ['english-classic','英字クラシック','Georgia,"Times New Roman",serif'],
 ['english-mono','英字タイプライター','"American Typewriter","Courier New",monospace']
];
const fonts=Object.fromEntries(fontList.map(([id,label,css])=>[id,{label,css}]));
const labels={front:'捕球面',back:'手の甲側',pinky:'小指側',thumb:'親指側'};
const defaultPositions={front:{x:.5,y:.65},back:{x:.5,y:.9},pinky:{x:.5,y:.5},thumb:{x:.5,y:.5}};
const items=[];
const canvas=document.querySelector('#canvas'),ctx=canvas.getContext('2d');
const palette=[['アイボリー','#eee8dc'],['ホワイト','#ffffff'],['キャメル','#c98a43'],['ライトキャメル','#d5a66f'],['オレンジ','#e87522'],['ピンク','#e9a7bb'],['ミント','#8bbfb6'],['レッド','#c62832'],['ネイビー','#203c63'],['ブラック','#242424'],['ゴールド','#d4af37']];
const bodyPalette=palette.map(([name,hex])=>[name,['レッド','ゴールド'].includes(name)?hex:'#'+Core.hexRgb(hex).map(v=>Math.round(v+(255-v)*.32).toString(16).padStart(2,'0')).join('')]);
defaults.body=bodyPalette[0][1];colors.body=defaults.body;
function load(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height);resolve({d,prepared:Core.prepare(d.data),w:im.width,h:im.height})};im.onerror=reject;im.src=src;});}
function faceItems(f=face){return items.filter(i=>i.face===f);}
function embroideryCount(){return items.filter(i=>i.text.trim()).length;}
function extraCost(){return Math.max(0,embroideryCount()-2)*1000;}
function drawText(item){if(!item.text.trim())return;ctx.save();if(item.face==='back'){ctx.beginPath();ctx.moveTo(canvas.width*.285,canvas.height*.84);ctx.lineTo(canvas.width*.70,canvas.height*.84);ctx.lineTo(canvas.width*.685,canvas.height*.965);ctx.lineTo(canvas.width*.285,canvas.height*.965);ctx.closePath();ctx.clip();}
const size=item.size*canvas.width/1305,maxW=canvas.width*(item.face==='back'?.40:.62);ctx.font='600 '+size+'px '+fonts[item.font].css;
const chars=Array.from(item.text),widths=chars.map(ch=>ctx.measureText(ch).width),total=widths.reduce((a,b)=>a+b,0),scale=Math.min(1,maxW/Math.max(1,total)),half=total*scale/2,bend=item.curve*canvas.height/1205;let cursor=-half;ctx.fillStyle=threadColor;ctx.textAlign='center';ctx.textBaseline='middle';for(let i=0;i<chars.length;i++){const w=widths[i]*scale,p=Core.arcPoint(cursor+w/2,half,bend);ctx.save();ctx.translate(item.x*canvas.width+p.x,item.y*canvas.height+p.y);ctx.rotate(p.angle);ctx.scale(scale,1);ctx.fillText(chars[i],0,0);ctx.restore();cursor+=w;}textBoxes.push({id:item.id,x:item.x*canvas.width-half-size,y:item.y*canvas.height-Math.max(0,bend)-size,w:half*2+size*2,h:Math.abs(bend)+size*2});ctx.restore();}
let textBoxes=[],dragState=null;
function render(){if(!ready)return;const item=cache[face];canvas.width=item.w;canvas.height=item.h;ctx.putImageData(new ImageData(Core.recolor(item.d.data,item.prepared,colors.body,colors.lace),item.w,item.h),0,0);if(window.ENLUMOWebArt)window.ENLUMOWebArt.draw(ctx,canvas,face);textBoxes=[];faceItems().forEach(drawText);canvas.style.transform='scale('+zoom+')';document.querySelector('#zoomLabel').textContent=Math.round(zoom*100)+'%';document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.id===face));for(const key of ['body','lace'])document.querySelectorAll('#'+key+'Palette button').forEach(b=>b.classList.toggle('selected',b.dataset.color===colors[key]));document.querySelector('#status').textContent=labels[face]+'を表示中';updatePrice();}
function updatePrice(){const count=embroideryCount(),extra=extraCost();const countEl=document.querySelector('#embroideryCount');if(countEl)countEl.textContent='刺繍 '+count+'箇所（3箇所目から1箇所 +¥1,000）'+(extra?' / 追加料金 ¥'+extra.toLocaleString('ja-JP'):'');const price=document.querySelector('#livePrice');if(price)price.textContent='¥'+(55000+extra).toLocaleString('ja-JP');}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};}
canvas.addEventListener('pointerdown',e=>{const p=point(e),box=[...textBoxes].reverse().find(b=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h);if(!box)return;const item=items.find(i=>i.id===box.id);dragState={id:item.id,x:p.x,y:p.y,sx:item.x,sy:item.y};canvas.setPointerCapture(e.pointerId);e.preventDefault();});
canvas.addEventListener('pointermove',e=>{if(!dragState)return;const p=point(e),d=dragState,item=items.find(i=>i.id===d.id);item.x=Math.max(.03,Math.min(.97,d.sx+(p.x-d.x)/canvas.width));item.y=Math.max(.03,Math.min(.97,d.sy+(p.y-d.y)/canvas.height));render();});
for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,()=>dragState=null);
for(const key of ['body','lace'])for(const[name,color]of (key==='body'?bodyPalette:palette)){const b=document.createElement('button');b.type='button';b.className='swatch';b.style.background=color;b.title=name;b.setAttribute('aria-label',name);b.dataset.color=color;b.onclick=()=>{colors[key]=color;render();};document.querySelector('#'+key+'Palette').append(b);}
function addItem(f=face){const p=defaultPositions[f];items.push({id:'emb-'+nextId++,face:f,text:'',font:'mincho',size:f==='back'?42:36,curve:0,x:p.x,y:p.y});renderControls();render();}
function renderControls(){const host=document.querySelector('#embroideryControls');host.replaceChildren();const list=faceItems();if(!list.length){const empty=document.createElement('p');empty.textContent='この面に文字はまだありません。';host.append(empty);}for(const item of list){const field=document.createElement('fieldset');field.className='text-setting';const legend=document.createElement('legend');legend.textContent='刺繍 '+(items.indexOf(item)+1);field.append(legend);const input=document.createElement('input');input.type='text';input.maxLength=24;input.value=item.text;input.placeholder='文字を入力';input.setAttribute('aria-label','刺繍文字');input.oninput=()=>{item.text=input.value;render();};field.append(input);
const fontLabel=document.createElement('label');fontLabel.textContent='フォント';const font=document.createElement('select');font.setAttribute('aria-label','フォント');for(const[id,entry]of Object.entries(fonts))font.add(new Option(entry.label,id));font.value=item.font;font.onchange=async()=>{item.font=font.value;await document.fonts.load('600 24px '+fonts[item.font].css).catch(()=>{});render();};fontLabel.append(font);field.append(fontLabel);
for(const[prop,title,min,max]of [['size','文字サイズ',12,100],['curve','丸み（下向き ↔ 上向き）',-350,350]]){const lab=document.createElement('label'),output=document.createElement('output');output.textContent=item[prop];lab.append(title+' ',output);const range=document.createElement('input');range.type='range';range.min=min;range.max=max;range.value=item[prop];range.setAttribute('aria-label',title);range.oninput=()=>{item[prop]=Number(range.value);output.value=range.value;render();};lab.append(range);field.append(lab);}
const remove=document.createElement('button');remove.type='button';remove.className='remove-embroidery';remove.textContent='この刺繍を削除';remove.onclick=()=>{items.splice(items.indexOf(item),1);renderControls();render();};field.append(remove);host.append(field);}
const add=document.createElement('button');add.type='button';add.className='add-embroidery';add.textContent='＋ この面に刺繍を追加';add.onclick=()=>addItem(face);host.append(add);updatePrice();}
const threadLabel=document.createElement('label');threadLabel.className='custom';threadLabel.textContent='刺繍の色';const picker=document.createElement('input');picker.type='color';picker.value=threadColor;picker.setAttribute('aria-label','刺繍の色');picker.oninput=()=>{threadColor=picker.value;render();};threadLabel.append(picker);document.querySelector('#embroideryControls').before(threadLabel);
for(const f of Object.keys(sources))document.querySelector('#'+f).onclick=()=>{face=f;renderControls();render();};
document.querySelector('#plus').onclick=()=>{zoom=Math.min(1.3,zoom+.1);render();};document.querySelector('#minus').onclick=()=>{zoom=Math.max(.6,zoom-.1);render();};document.querySelector('#goTop').onclick=()=>location.href='../index.html';document.querySelector('#resetTextPositions').onclick=()=>{items.forEach(i=>Object.assign(i,defaultPositions[i.face]));render();};document.querySelector('#reset').onclick=()=>{colors={...defaults};zoom=1;render();};document.querySelector('#download').onclick=()=>{if(!ready)return;const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='ENLUMO-'+face+'.png';a.click();};
function designData(){const name=(hex,set)=>set.find(([,c])=>c===hex)?.[0]||hex;const entries=items.filter(i=>i.text.trim()).map(i=>({face:labels[i.face],text:i.text,font:fonts[i.font].label,size:i.size,curve:i.curve,x:i.x,y:i.y}));const summary=entries.map(i=>i.face+'：'+i.text+'（'+i.font+'・サイズ'+i.size+'・丸み'+i.curve+'）').join(' / ');const art=window.ENLUMOWebArt?.summary()||'';return{model:'ENLUMO カスタムグローブ',body:name(colors.body,bodyPalette)+(['レッド','ゴールド'].includes(name(colors.body,bodyPalette))?'':'（淡色）'),lace:name(colors.lace,palette),stitch:threadColor,embroidery:(summary+art)||'なし',embroidery_layout:JSON.stringify({entries,web_art:art}),embroidery_count:entries.length,embroidery_extra:extraCost(),price:55000+extraCost()};}
function buildOrderUrl(){render();try{sessionStorage.setItem('enlumo_order_draft',JSON.stringify({...designData(),preview:canvas.toDataURL('image/jpeg',.86),face:labels[face]}));}catch(e){sessionStorage.setItem('enlumo_order_draft',JSON.stringify(designData()));}return '../order.html';}
window.ENLUMOSimulator={render,getFace:()=>face,setFace:f=>{if(labels[f]){face=f;renderControls();render();}},capture:()=>canvas.toDataURL('image/jpeg',.86)};
document.querySelector('#nextPage').onclick=()=>location.href=buildOrderUrl();
Promise.all(Object.entries(sources).map(async([key,src])=>cache[key]=await load(src))).then(async()=>{ready=true;await Promise.all(['Yuji Syuku','Yuji Boku','Yuji Mai','Shippori Mincho','Shippori Mincho B1','Zen Old Mincho','Kaisei Decol','Klee One','Zen Kurenaido','Yusei Magic'].map(f=>document.fonts.load('600 24px "'+f+'"').catch(()=>{})));renderControls();render();}).catch(()=>document.querySelector('#status').textContent='画像を読み込めませんでした。ページを開き直してください。');
