import {renderF1Unit,renderF1Lesson,renderF1Review,configureF2} from './f1.js';
import {mountMathTools} from './math-tools.js';
import {initializeTranslations,observeDOM,applyDOM,setLanguage,getLanguage,translatedView} from './i18n-e3.js';
const main=document.querySelector('#main');
const TARGET='E3-A02';
const unitRoute='#/curso/E3/unidad/E3-A02';
let fullCatalog,unitDoc,bank,unit,course,lessons;
let sourceDoc,sourceBank,localeOverlay,secondHints;
function renderInLanguage(lang){
 const translated=translatedView(sourceDoc,sourceBank,localeOverlay,secondHints,lang);
 unitDoc=translated.unit;bank=translated.bank;
 const languageTitle=lang==='ca'?'Equacions quadràtiques i sistemes':null;
 unit=lang==='ca'
   ? {...course.units.find(x=>x.unit_id===TARGET),
       lessons:course.units.find(x=>x.unit_id===TARGET).lessons.map(x=>({
         ...x,title:localeOverlay.lessons[x.lesson_id].title}))}
   :course.units.find(x=>x.unit_id===TARGET);
 lessons=new Map(unit.lessons.map(x=>[x.lesson_id,x]));
 setLanguage(lang);
 route();
 applyDOM(document.body);
 const h1=main.querySelector('h1');
 if(h1)document.title=h1.textContent+' · WEB MATES Beta';
}
function captureActiveExercise(){
 const area=main.querySelector('.f1-question');
 if(!area||!area.dataset.exerciseId)return;
 const form=area.querySelector('form');
 if(!form)return;
 const radio=form.querySelector('input[name="answer"]:checked');
 const input=form.querySelector('input[type="text"]');
 const memory=window.__wmExerciseViewState ||= new Map();
 memory.set(location.hash||'#/',{exerciseId:area.dataset.exerciseId,
   answer:radio?.value??input?.value??''});
}

function element(tag,text='',className=''){
 const x=document.createElement(tag);x.textContent=text;if(className)x.className=className;return x;
}
function link(title,href){const a=element('a',title);a.href=href;return a;}
function box(){const s=element('div','','shell');main.replaceChildren(s);return s;}
function heading(s,title,desc){
 const h=element('header','','hero');h.append(element('div','BETA EDUCATIVA · 3.º ESO','eyebrow'),
 element('h1',title),element('p',desc,'lead'));s.append(h);
}
function notice(s,text){const n=element('div',text,'notice');n.setAttribute('role','note');s.append(n);}
function home(){
 const s=box();
 heading(s,'Practica ecuaciones y sistemas',
   '3.º ESO · Unidad E3-A02 · 6 lecciones y 30 ejercicios con ejemplos, pistas y corrección explicada.');
 const meta=element('p','Empieza por una explicación, practica cinco ejercicios y termina con un repaso. Sin reloj ni registro.','flow-meta');
 s.append(meta);
 const first=lessons.keys().next().value;
 const learnRoute=unitRoute+'/leccion/'+encodeURIComponent(first);
 const practiceRoute=learnRoute+'/practicar';
 const flow=element('section','','learning-flow');
 const title=element('h2','Elige qué quieres hacer');flow.append(title);
 const grid=element('div','','flow-steps');
 const steps=[
  {num:'1',label:'Aprender',desc:'Comprende la idea con un ejemplo resuelto paso a paso.',action:'Empezar la primera lección',href:learnRoute},
  {num:'2',label:'Practicar',desc:'Resuelve ejercicios y recibe pistas cuando las necesites.',action:'Ir a los 5 ejercicios',href:practiceRoute},
  {num:'3',label:'Repasar',desc:'Recupera lo aprendido y vuelve a intentar lo que te cuesta.',action:'Repasar esta sesión',href:'#/repaso-e3-a02'}
 ];
 for(const item of steps){
  const card=element('article','','card flow-step');
  card.append(element('span','PASO '+item.num,'flow-step-number'),
    element('h3',item.label),element('p',item.desc));
  const action=link(item.action,item.href);action.className='flow-step-link';
  card.append(action);grid.append(card);
 }
 flow.append(grid);s.append(flow);
 const index=element('section','','card flow-unit');
 index.append(element('h2','¿Prefieres elegir una lección?'),
  element('p','Accede al índice de las seis lecciones de ecuaciones cuadráticas y sistemas.'),
  link('Abrir las seis lecciones',unitRoute));
 s.append(index);
 const community=element('section','','card flow-unit');
 community.append(element('h2','Ayúdanos a mejorar esta beta'),
   element('p','Esta web se ha creado con inteligencia artificial. Sus ejercicios han pasado pruebas automáticas, pero no han sido revisados por expertos humanos. Ayúdanos a encontrar errores y proponer cambios.'),
   link('Dejar un comentario sin GitHub',getLanguage()==='ca'?'./comentaris.html':'./comentarios.html'),
   element('span',' · '),link('Proponer un cambio en GitHub','https://github.com/JoanAbad82/math/pulls'));
 s.append(community);
 notice(s,'Versión educativa en revisión, no homologada. Las respuestas y el progreso desaparecen al recargar esta página.');
}
function coursePage(){
 const s=box();heading(s,'3.º ESO · Matemáticas','Alcance de esta beta: únicamente E3-A02.');
 notice(s,'Las otras unidades del catálogo completo siguen en desarrollo; no se ofrecen desde esta beta.');
 s.append(link('E3-A02 · Ecuaciones cuadráticas y sistemas',unitRoute));
}
function unitPage(){const s=box();renderF1Unit({container:s,data:unitDoc,bank,unit});}
function lessonPage(id,openPractice=false){
 const lesson=lessons.get(id);
 if(!lesson)return notFound();
 const s=box();
 if(!renderF1Lesson({container:s,data:unitDoc,bank,lessonId:id,title:lesson.title}))return notFound();
 mountMathTools(s);
 if(openPractice){
  const practiceHeading=s.querySelector('[data-practice-start]');
  practiceHeading?.focus({preventScroll:false});
 }
}
function reviewPage(){const s=box();renderF1Review({container:s,data:unitDoc,bank});}
function about(){
 const s=box();heading(s,'Acerca de esta beta',
  'WEB MATES es una web gratuita de práctica matemática, no un centro de enseñanza ni organismo acreditador.');
 const paras=[
 'Alcance real: E3-A02, seis lecciones y 30 ejercicios; las otras 499 lecciones del catálogo canónico no se distribuyen en esta beta.',
 'Los ejercicios y sus soluciones se encuentran en revisión. Esta versión puede contener errores y no expide títulos, certificados ni notas oficiales.',
 'La corrección de las respuestas se ejecuta en este navegador. Los aciertos y errores permanecen solo durante la pestaña y se pierden al recargar. No hay cuentas ni analítica propia.',
 'El proveedor de alojamiento, cuando se contrate, podrá tratar IP y registros de acceso; antes del lanzamiento se completará la información de privacidad y la identificación del operador.',
 'Código y contenidos originales bajo MIT; referencias normativas del BOE sin reivindicar derechos sobre ellas. Proyecto y desarrollo web: Joan.'
 ];
 for(const p of paras)s.append(element('p',p));
 s.append(link('Volver a practicar',unitRoute));
}
function notFound(){
 const s=box();heading(s,'Contenido fuera de esta beta',
 'La ruta solicitada no está disponible: solo E3-A02 puede consultarse y practicarse.');
 s.append(link('Ir a la unidad disponible',unitRoute));
}
function route(){
 let a;
 try{a=decodeURIComponent(location.hash.replace(/^#\/?/,'')).split('/').filter(Boolean);}
 catch(e){if(e instanceof URIError)return notFound();throw e;}
 if(a.length===0)return home();
 if(a.length===2&&a[0]==='curso'&&a[1]==='E3')return coursePage();
 if(a.length===4&&a[0]==='curso'&&a[1]==='E3'&&a[2]==='unidad'&&a[3]===TARGET)return unitPage();
 if(a.length===6&&a[0]==='curso'&&a[1]==='E3'&&a[2]==='unidad'&&a[3]===TARGET&&a[4]==='leccion')
  return lessonPage(a[5]);
 if(a.length===7&&a[0]==='curso'&&a[1]==='E3'&&a[2]==='unidad'&&a[3]===TARGET&&a[4]==='leccion'&&a[6]==='practicar')
  return lessonPage(a[5],true);
 if(a.length===1&&a[0]==='repaso-e3-a02')return reviewPage();
 if(a.length===1&&a[0]==='repaso')return reviewPage();
 if(a.length===1&&a[0]==='acerca')return about();
 return notFound();
}
async function start(){
 try{
  const endpoints=['./data/catalogo.json','./data/f1_e3_a02.json','./data/f1_e3_a02_exercises.json',
   './i18n/ca-ES/E3-A02.v1.json','./i18n/ca-ES/E3-A02.choices.v1.json',
   './i18n/ca-ES/E3-A02.second-hints.v1.json','./i18n/ca-ES/ui-E3-A02.v1.json',
   './i18n/ca-ES/manifest.v1.json'];
  const requests=await Promise.all(endpoints.map(path=>fetch(path,{cache:'no-store'})));
  if(requests.some(x=>!x.ok))throw Error('Falta un archivo local de la beta bilingüe.');
  const bytes=await Promise.all(requests.map(r=>r.arrayBuffer()));
  const texts=bytes.map(b=>new TextDecoder('utf-8',{fatal:true}).decode(b));
  const [catalog,originalDoc,originalBank,overlay,choice,hints,words,manifest]=texts.map(x=>JSON.parse(x));
  const digest=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)))
    .map(x=>x.toString(16).padStart(2,'0')).join('');
  if(manifest.unit_id!==TARGET||manifest.translation_status!=='draft_unreviewed'||
      overlay.unit_id!==TARGET||overlay.locale!=='ca-ES'||choice.unit_id!==TARGET||hints.unit_id!==TARGET)
    throw Error('Contrato bilingüe incompleto.');
  const overlayNames=['E3-A02.v1.json','E3-A02.choices.v1.json',
    'E3-A02.second-hints.v1.json','ui-E3-A02.v1.json'];
  if(!manifest.overlays_sha256||overlayNames.length!==Object.keys(manifest.overlays_sha256).length)
    throw Error('Falta la comprobación de integridad de las traducciones.');
  for(let k=0;k<overlayNames.length;k++){
    if(await digest(bytes[k+3])!==manifest.overlays_sha256[overlayNames[k]])
      throw Error('Hash de traducción no válido: '+overlayNames[k]);
  }
  if(await digest(bytes[1])!==manifest.canonical.lesson_doc_sha256||
      await digest(bytes[2])!==manifest.canonical.exercise_bank_sha256||
      overlay.source_files_sha256['data/f1_e3_a02.json']!==manifest.canonical.lesson_doc_sha256||
      overlay.source_files_sha256['data/f1_e3_a02_exercises.json']!==manifest.canonical.exercise_bank_sha256||
      choice.source_bank_sha256!==manifest.canonical.exercise_bank_sha256||
      hints.source_bank_sha256!==manifest.canonical.exercise_bank_sha256)
    throw Error('No coincide el banco fuente con las traducciones.');
  fullCatalog=catalog;unitDoc=originalDoc;bank=originalBank;
  sourceDoc=originalDoc;localeOverlay=overlay;secondHints=hints;
  initializeTranslations(words,choice);
  const courses=fullCatalog.courses,units=courses.flatMap(x=>x.units),
   allLessons=units.flatMap(x=>x.lessons);
  if(courses.length!==9||units.length!==85||allLessons.length!==505)
   throw new Error('Catálogo canónico inconsistente');
  course=courses.find(x=>x.code==='E3');
  unit=course?.units.find(x=>x.unit_id===TARGET);
  if(!unit||unit.lessons.length!==6||unitDoc.unit_id!==TARGET||
      unitDoc.lesson_documents.length!==6||bank.activities.length!==30)
   throw new Error('La beta no conserva las seis lecciones y las 30 actividades');
  const ids=new Set(unit.lessons.map(x=>x.lesson_id));
  if(ids.size!==6||new Set(unitDoc.lesson_documents.map(x=>x.lesson_id)).size!==6||
     unitDoc.lesson_documents.some(x=>!ids.has(x.lesson_id))||
     bank.activities.some(x=>!ids.has(x.lesson_id))||
     new Set(bank.activities.map(x=>x.exercise_id)).size!==30)
   throw new Error('IDs de lecciones o ejercicios inconsistentes');
  bank.activities=bank.activities.map(x=>({...x,...(bank.validation_metadata[x.exercise_id]||{})}));
  sourceBank=bank;
  configureF2({data:sourceDoc,bank:sourceBank,storage:null});
  lessons=new Map(unit.lessons.map(x=>[x.lesson_id,x]));
  const selected=new URL(location.href).searchParams.get('lang')==='ca'?'ca':'es';
  const switcher=document.querySelector('#locale-select');
  if(!switcher)throw Error('Falta el selector de idioma.');
  switcher.addEventListener('change',()=>{
    captureActiveExercise();
    const url=new URL(location.href);
    url.searchParams.set('lang',switcher.value);
    history.replaceState(null,'',url.pathname+url.search+url.hash);
    renderInLanguage(switcher.value);
  });
  observeDOM();
  renderInLanguage(selected);
  window.addEventListener('hashchange',()=>{
    route();
    const h1=main.querySelector('h1');
    if(h1){
      const practiceRoute=location.hash.endsWith('/practicar');
      const target=practiceRoute?main.querySelector('[data-practice-start]'):h1;
      if(target){
        target.tabIndex=-1;
        target.focus({preventScroll:!practiceRoute});
      }
      document.title=h1.textContent+' · WEB MATES Beta';
    }
  });
  // renderInLanguage already rendered the current route.
 }catch(err){
  const s=box();heading(s,'No se pudo abrir la beta','Comprueba los archivos y vuelve a cargar.');
  notice(s,'Error de integridad o carga. '+err.message);
 }
}
start();
