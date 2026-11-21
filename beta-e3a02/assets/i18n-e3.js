// WEB MATES E3-A02 bilingual presentation. No changes to deterministic engine.
let active='es';
let words={};
let choices=null;
const originals=new WeakMap(),attributeOriginals=new WeakMap();
let observer=null,locked=false;
export function getLanguage(){return active;}
export function initializeTranslations(dictionary,choiceOverlay){
 words=dictionary;choices=choiceOverlay;
}
const dynamic=[
 [/^Lección (\d+): (.*)$/u,m=>'Lliçó '+m[1]+': '+m[2]],
 [/^(E3-A02-L\d\d) · Contenido F1 (.*) · En revisión$/u,m=>m[1]+' · Contingut F1 '+m[2]+' · En revisió'],
 [/^ · prerrequisito recomendado fuera del alcance de esta beta$/u,m=>' · prerequisit recomanat fora de l’abast d’aquesta beta'],
 [/^ · (\d+) ejercicios$/u,m=>' · '+m[1]+' exercicis'],
 [/^PASO (\d+)$/u,m=>'PAS '+m[1]],
 [/^Actividad (\d+) de (\d+) · Solo en esta sesión$/u,m=>'Activitat '+m[1]+' de '+m[2]+' · Només en aquesta sessió'],
 [/^Actividad (.*) · EN REVISIÓN · Dificultad (\d+)\/5$/u,m=>'Activitat '+m[1]+' · EN REVISIÓ · Dificultat '+m[2]+'/5'],
 [/^Ejemplo guiado (\d+)$/u,m=>'Exemple guiat '+m[1]],
 [/^Responder actividad (.*)$/u,m=>'Respondre a l’activitat '+m[1]],
 [/^Pista (\d+): (.*)$/us,m=>'Pista '+m[1]+': '+m[2]],
 [/^Pista (\d+)$/u,m=>'Pista '+m[1]],
 [/^Correcto\. (.*)$/us,m=>'Correcte. '+m[1]],
 [/^Aún no\. Revisa el planteamiento\. (.*)$/us,m=>'Encara no. Revisa el plantejament. '+m[1]],
 [/^Solución explicada: (.*)$/us,m=>'Solució explicada: '+m[1]],
 [/^Formato no admitido\. (.*)$/us,m=>'Format no admès. '+tr(m[1])],
 [/^Término (.*)\. Pulsa para aplicar la operación inversa en ambos lados o arrastra a la derecha\.$/us,
  m=>'Terme '+m[1]+'. Prem per aplicar l’operació inversa als dos membres o arrossega’l cap a la dreta.'],
 [/^Ecuación: (.*)$/us,m=>'Equació: '+m[1]],
 [/^Resultado: (.*)$/us,m=>'Resultat: '+m[1]],
 [/^No se pudo calcular: (.*)$/us,m=>'No s’ha pogut calcular: '+m[1]],
 [/^No se pudo resolver: (.*)$/us,m=>'No s’ha pogut resoldre: '+m[1]],
 [/^Dividir ambos lados entre (.*)$/us,m=>'Divideix els dos membres per '+m[1]],
 [/^Restar (.*) a ambos lados$/us,m=>'Resta '+m[1]+' als dos membres'],
 [/^Sumar (.*) a ambos lados$/us,m=>'Suma '+m[1]+' als dos membres'],
 [/^Para quitar (.*) del lado izquierdo, (restamos|sumamos) (.*) a los dos miembros\.$/us,
  m=>'Per eliminar '+m[1]+' del membre esquerre, '+(m[2]==='restamos'?'restem ':'sumem ')+m[3]+' als dos membres.'],
 [/^Dividimos los dos miembros entre (.*) \(nunca solo el lado izquierdo\)\.$/us,
  m=>'Dividim els dos membres per '+m[1]+' (mai només el membre esquerre).'],
 [/^Comprobación: (.*)$/us,m=>'Comprovació: '+m[1]],
 [/^D = 0: una única raíz real doble\. x = (.*)$/us,m=>'D = 0: una única arrel real doble. x = '+m[1]],
 [/^x₁ ≈ (.*) y x₂ ≈ (.*)$/us,m=>'x₁ ≈ '+m[1]+' i x₂ ≈ '+m[2]],
 [/^Nuevo ejemplo: (.*)$/us,m=>'Exemple nou: '+m[1]],
 [/^Paso deshecho\. Ecuación actual: (.*)$/us,m=>'Pas desfet. Equació actual: '+m[1]],
 [/^Introducir (.*)$/us,m=>'Introdueix '+m[1]],
 [/^Arrastra el término (.*) al segundo miembro o pulsa el botón\. Verás la operación aplicada a ambos lados\.$/us,
  m=>'Arrossega el terme '+m[1]+' al segon membre o prem el botó. Veuràs l’operació aplicada als dos membres.'],
 [/^Al soltar: (.*)$/us,m=>'En deixar-lo anar: '+m[1]],
 [/^Tienes (\d+) actividades cuyo repaso ha vencido\. Recupera sin pistas\.$/u,m=>'Tens '+m[1]+' activitats amb repàs vençut. Recupera-les sense pistes.'],
 [/^Has tenido dificultad con (\d+) actividad\(es\)\. Reinténtalas sin ayuda\.$/u,m=>'Has tingut dificultats amb '+m[1]+' activitats. Torna-les a provar sense ajuda.'],
 [/^Preguntas programadas: (\d+) · Vencidas hoy: (\d+)(.*)$/us,m=>
  'Preguntes programades: '+m[1]+' · Vençudes avui: '+m[2]+m[3].replace('Las fechas se perderán al cerrar o recargar la página; la pauta entre días es manual.','Les dates es perdran en tancar o tornar a carregar la pàgina; la pauta entre dies és manual.')],
 [/^La ecuación ya está resuelta\.$/u,m=>'L’equació ja està resolta.']
];
function translateCA(original){
 if(typeof original!=='string')return original;
 if(Object.prototype.hasOwnProperty.call(words,original))return words[original];
 const trimmed=original.trim();
 if(Object.prototype.hasOwnProperty.call(words,trimmed))return original.replace(trimmed,words[trimmed]);
 for(const [pattern,translate] of dynamic){const m=original.match(pattern);if(m)return translate(m);}
 return original;
}
export function tr(original){return active==='ca'?translateCA(original):original;}
function localizeText(node){
 if(!node.parentElement||node.parentElement.closest('script,style,code,pre,textarea,[data-no-i18n]'))return;
 const current=node.nodeValue;
 let source=originals.get(node);
 if(source===undefined||(current!==source&&current!==translateCA(source))){
  source=current;originals.set(node,source);
 }
 const target=translateFromSource(source);
 if(current!==target)node.nodeValue=target;
}
function translateFromSource(value){return active==='ca'?tr(value):value;}
export function applyDOM(root=document.body){
 if(!root||locked)return;
 locked=true;
 try{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;while((node=walker.nextNode()))localizeText(node);
  const elements=[...(root.nodeType===1?[root]:[]),...root.querySelectorAll('*')];
  for(const el of elements){
   for(const attr of ['aria-label','title','placeholder']){
    const val=el.getAttribute(attr);if(val===null)continue;
    let memo=attributeOriginals.get(el);
    if(!memo){memo={};attributeOriginals.set(el,memo);}
    let orig=memo[attr];
    if(orig===undefined||(val!==orig&&val!==translateCA(orig))){orig=val;memo[attr]=orig;}
    const wanted=translateFromSource(orig);
    if(val!==wanted)el.setAttribute(attr,wanted);
   }
  }
 }finally{locked=false;}
}
export function observeDOM(){
 if(observer)return;
 observer=new MutationObserver(records=>{if(records.length)applyDOM(document.body);});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,
  attributes:true,attributeFilter:['aria-label','title','placeholder']});
}
export function setLanguage(lang){
 if(!['es','ca'].includes(lang))throw Error('Unknown language');
 active=lang;
 document.documentElement.lang=lang;
 document.documentElement.dataset.locale=lang;
 const selector=document.querySelector('#locale-select');
 if(selector)selector.value=lang;
 applyDOM(document.body);
 const privacy=document.querySelector('.site-footer a[data-privacy-link]');
 if(privacy)privacy.href=lang==='ca'?'./privacitat.html':'./privacidad.html';
 const feedback=document.querySelector('.site-footer a[data-feedback-link]');
 if(feedback)feedback.href=lang==='ca'?'./comentaris.html':'./comentarios.html';
}
export function choiceLabel(exerciseId,index,source){
 if(active!=='ca')return source;
 const row=choices&&choices.activities[exerciseId];
 if(!row)return source;
 if(row.source_choices[index]!==source)throw Error('Source option mismatch: '+exerciseId);
 return row.labels[index];
}
export function translatedView(srcDoc,srcBank,overlay,hints,lang){
 const unit=structuredClone(srcDoc), bank=structuredClone(srcBank);
 if(lang!=='ca')return {unit,bank};
 unit.locale='ca-ES';
 unit.unit_title='Equacions quadràtiques i sistemes';
 unit.unit_objectives=[
  'Triar el mètode distingint equacions lineals, quadràtiques incompletes i completes.',
  'Resoldre i comprovar equacions quadràtiques i interpretar el discriminant.',
  'Resoldre sistemes 2×2 i utilitzar models algebraics en contextos amb restriccions.'
 ];
 for(const item of unit.prerequisite_links){
  const replacements={
   'Ecuaciones lineales de 2.º ESO':'Equacions lineals de 2n d’ESO',
   'Factor común y polinomios':'Factor comú i polinomis',
   'Sistemas sencillos de 2.º ESO':'Sistemes senzills de 2n d’ESO'};
  item.label=replacements[item.label]||item.label;
 }
 for(const lesson of unit.lesson_documents){
  const row=overlay.lessons[lesson.lesson_id];
  if(!row||row.content_blocks.length!==lesson.content_blocks.length)throw Error('Incomplete Catalan lesson '+lesson.lesson_id);
  lesson.locale='ca-ES';
  lesson.objectives=[...row.objectives];
  lesson.content_blocks=lesson.content_blocks.map((block,i)=>({...block,body:row.content_blocks[i].body}));
 }
 bank.activities=bank.activities.map(item=>{
  const entry=overlay.activities[item.exercise_id],extra=hints.activities[item.exercise_id];
  if(!entry||!extra||extra.hints.length!==2)throw Error('Missing Catalan activity '+item.exercise_id);
  return {...item,prompt:entry.prompt,hint:entry.hint,explanation:entry.explanation,hints:[...extra.hints]};
 });
 return {unit,bank};
}
