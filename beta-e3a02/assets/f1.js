// WEB MATES — F2. Presentación E3-A02 que reutiliza el núcleo /core sin tocar fuentes.
import {parseScalar,parseRoots,validateAnswer} from './core/validator.js';
import {createExerciseEngine} from './core/engine.js';
import {choiceLabel} from './i18n-e3.js';
export {parseScalar,parseRoots,validateAnswer};
let exerciseEngine=null;
export function configureF2({data,bank,storage=null,now=()=>new Date()}){
 if(exerciseEngine)return exerciseEngine;
 if(data?.unit_id!=='E3-A02'||bank?.activities?.length!==30)throw new Error('Datos F2 incompletos');
 exerciseEngine=createExerciseEngine({activities:bank.activities,docs:data.lesson_documents,
   storage,unitId:data.unit_id,now});
 return exerciseEngine;
}
const $e=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=String(text??'');if(cls)n.className=cls;return n;};
const append=(parent,...children)=>{children.forEach(c=>parent.append(c));return parent;};
const link=(text,href)=>{const n=$e('a',text);n.href=href;return n;};
const escId=id=>encodeURIComponent(id);
const courseUrl=()=>'#/curso/E3';
const unitUrl=()=>courseUrl()+'/unidad/E3-A02';
const lessonUrl=id=>unitUrl()+'/leccion/'+escId(id);
function prereqUrl(id){
 const m=/^(E[1-3]|E4[AB]|B[12][CS])-([A-Z]\d{2})-L\d{2}$/.exec(id||'');
 return null; // beta de E3-A02: prerrequisitos externos visibles solo como texto, no rutas rotas
}
function bread(parent,links){
 const ol=$e('ol','','breadcrumbs');ol.setAttribute('aria-label','Ruta de navegación');
 links.forEach(([label,href])=>{const li=$e('li');li.append(href?link(label,href):$e('span',label));ol.append(li);});
 parent.append(ol);
}
function note(parent,text){
 const el=$e('div',text,'notice');el.setAttribute('role','note');parent.append(el);
}
function section(parent,heading,body){
 const wrap=$e('section','','card f1-section');
 append(wrap,$e('h2',heading),$e('p',body,'f1-multiline'));
 parent.append(wrap);
 return wrap;
}
function renderBlocks(parent,doc){
 const wrapper=$e('div','','f1-blocks');
 let example=0;
 for(const block of doc.content_blocks){
   const el=$e('section','','card f1-block');
   const heading={text:'Entiende la idea',example:'Ejemplo guiado',figure:'Representación visual y verbal',
     summary:'Resumen para recordar',reflection:'Recuperación activa'}[block.type]||'Contenido';
   el.append($e('h2',heading+(block.type==='example'?' '+(++example):'')));
   if(block.type==='reflection'){
     const [question,answer]=block.body.split('||');
     const q=$e('p',question,'f1-multiline'),b=$e('button','Mostrar comprobación','subtle');
     b.type='button';
     const out=$e('p',answer??'','f1-reveal');out.hidden=true;
     b.addEventListener('click',()=>{out.hidden=!out.hidden;b.textContent=out.hidden?'Mostrar comprobación':'Ocultar comprobación';});
     append(el,q,b,out);
   }else{
     const p=$e('p',block.body,'f1-multiline');
     if(block.type==='figure')p.setAttribute('aria-label','Representación descrita en texto');
     el.append(p);
   }
   wrapper.append(el);
 }
 parent.append(wrapper);
}
const lessonItems=(bank,id)=>bank.activities.filter(x=>x.lesson_id===id);
const progressText=(items,i)=>'Actividad '+(i+1)+' de '+items.length+
 ' · Solo en esta sesión';
function practice(parent,items,title='Practica con corrección'){
  const wrapper=$e('section','','f1-practice');
  const practiceHeading=$e('h2',title);
  practiceHeading.dataset.practiceStart='true';practiceHeading.tabIndex=-1;
  wrapper.append(practiceHeading);
 wrapper.append($e('p','Intenta responder sin mirar las pistas. El motor comprueba números de forma determinista y explica cada resultado.','hint'));
 const area=$e('div','','card f1-question');wrapper.append(area);parent.append(wrapper);
 const memory=window.__wmExerciseViewState ||= new Map();
 const routeKey=location.hash||'#/';
 const saved=memory.get(routeKey);
 const found=items.findIndex(item=>item.exercise_id===saved?.exerciseId);
 let index=found>=0?found:0,wrongCount=0,hintLevel=0;
 function draw(focusHeading=false){
  if(!items.length){area.replaceChildren($e('p','No hay actividades en esta selección.'));return;}
  const item=items[index];
  wrongCount=0;hintLevel=0;
  area.replaceChildren();area.dataset.exerciseId=item.exercise_id;
  const heading=$e('h3',progressText(items,index),'f1-question-index');heading.tabIndex=-1;
  const prompt=$e('p',item.prompt,'f1-question-prompt');
  const form=$e('form');form.noValidate=true;form.setAttribute('aria-label','Responder actividad '+item.exercise_id);
  let input=null;
  if(item.type==='choice'){
    const field=$e('fieldset','','f1-choice');field.append($e('legend','Elige una respuesta'));
    item.choices.forEach((answer,i)=>{
      const lab=$e('label','','f1-choice-row');
      const radio=$e('input');radio.type='radio';radio.name='answer';radio.value=answer;radio.id='f1-'+item.exercise_id+'-'+i;
      append(lab,radio,$e('span',choiceLabel(item.exercise_id,i,answer)));field.append(lab);
    });
    form.append(field);
  }else{
    const label=$e('label',item.type==='roots'?'Dos raíces reales (separa con ; o coma)':'Tu respuesta');
    label.htmlFor='f1-response';
    input=$e('input');input.type='text';input.id='f1-response';input.autocomplete='off';input.spellcheck=false;
    input.inputMode=item.type==='numeric'?'decimal':'text';input.setAttribute('aria-describedby','f1-format');
    const help=$e('p',item.type==='roots'?'Ejemplos: −2; 0,5 o 2,3 (dos enteros). Puedes invertir el orden.':'Se admite coma decimal, punto o una fracción simple como 1/2.','hint');
    help.id='f1-format';append(form,label,input,help);
  }
  if(saved&&saved.exerciseId===item.exercise_id){
   if(input)input.value=saved.answer||'';
   else for(const radio of form.querySelectorAll('input[name="answer"]')){
    radio.checked=radio.value===saved.answer;
   }
  }
  form.addEventListener('input',()=>remember());
  form.addEventListener('change',()=>remember());
  function remember(){
   memory.set(routeKey,{exerciseId:item.exercise_id,
     answer:form.querySelector('input[name="answer"]:checked')?.value??input?.value??''});
  }
  const controls=$e('div','','btnrow');
  const submit=$e('button','Comprobar','action');submit.type='submit';
  const hint=$e('button','Pista 1','subtle');hint.type='button';
  const solution=$e('button','Ver solución razonada','subtle');solution.type='button';solution.hidden=true;
  append(controls,submit,hint,solution);form.append(controls);
  const feedback=$e('div','','feedback f1-feedback');feedback.setAttribute('role','status');
  feedback.setAttribute('aria-live','polite');feedback.hidden=true;
  hint.addEventListener('click',()=>{
    hintLevel=Math.min(hintLevel+1,item.hints?.length||1);
    exerciseEngine?.assist(item);
    feedback.hidden=false;feedback.className='feedback f1-feedback';
    feedback.textContent='Pista '+hintLevel+': '+(item.hints?.[hintLevel-1]||item.hint);
    hint.textContent='Pista '+Math.min(hintLevel+1,item.hints?.length||1);
    if(hintLevel>=(item.hints?.length||1))hint.disabled=true;
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const raw=item.type==='choice'?form.querySelector('input[name=answer]:checked')?.value??'':input?.value??'';
    const outcome=exerciseEngine.submit(item,raw,{hintUsed:hintLevel>0});
    feedback.hidden=false;
    if(!outcome.valid){
      feedback.className='feedback bad f1-feedback';
      feedback.textContent='Formato no admitido. '+(item.type==='roots'?'Escribe dos números, por ejemplo: -2; 0,5.':'Introduce una respuesta válida.');
      return;
    }
    if(outcome.correct){
      feedback.className='feedback good f1-feedback';feedback.textContent='Correcto. '+item.explanation;
      solution.hidden=true;
    }else{
      wrongCount++;
      feedback.className='feedback bad f1-feedback';
      feedback.textContent='Aún no. Revisa el planteamiento. '+(item.hints?.[Math.min(wrongCount-1,(item.hints?.length||1)-1)]||item.hint);
      if(outcome.repair?.text){
        append(feedback,$e('p',outcome.repair.text,'hint'));
        const linkTo=prereqUrl(outcome.repair.lessonId);
        if(linkTo)feedback.append(link('Repasar prerrequisito: '+outcome.repair.lessonId,linkTo));
      }
      solution.hidden=false;
    }
  });
  solution.addEventListener('click',()=>{
    exerciseEngine?.assist(item);
    feedback.hidden=false;feedback.className='feedback f1-feedback';
    feedback.textContent='Solución explicada: '+item.explanation;
  });
  const nav=$e('div','','btnrow');
  const prev=$e('button','Anterior','subtle');prev.type='button';prev.disabled=index===0;
  const next=$e('button',index===items.length-1?'Volver a la primera':'Siguiente','subtle');next.type='button';
  prev.addEventListener('click',()=>{index=Math.max(0,index-1);
   memory.set(routeKey,{exerciseId:items[index].exercise_id,answer:''});draw(true);});
  next.addEventListener('click',()=>{index=(index+1)%items.length;
   memory.set(routeKey,{exerciseId:items[index].exercise_id,answer:''});draw(true);});
  append(nav,prev,next);
  append(area,heading,prompt,form,feedback,nav,
   $e('p','Actividad '+item.exercise_id+' · '+(item.review_status==='borrador'?'EN REVISIÓN':'DEMOSTRACIÓN')+' · Dificultad '+item.difficulty+'/5','hint'));
  if(focusHeading)heading.focus({preventScroll:true});
 }
 draw();
}
function prerequisite(parent,data){
 const sec=$e('section','','card f1-section');sec.append($e('h2','Antes de empezar: requisitos'));
 const ul=$e('ul');data.prerequisite_links.forEach(x=>{const li=$e('li');li.append($e('span',x.label+' · prerrequisito recomendado fuera del alcance de esta beta'));ul.append(li);});
 sec.append(ul);parent.append(sec);
}
function localStorageStatus(parent,onUpdate){
 const box=$e('section','','card f2-storage');
 box.append($e('h2','Repaso en esta sesión'));
 box.append($e('p','Los resultados y fechas de repaso se mantienen solo mientras esta página sigue abierta. Al recargar o cerrar se perderán. Para estudiar en días posteriores, vuelve a practicar según la pauta orientativa D+1, D+3, D+7, D+14 y D+30; no hay seguimiento automático.','hint'));
 parent.append(box);
}

export function renderF1Unit({container,data,bank,unit}){
 bread(container,[['Inicio','#/'],['3.º ESO',courseUrl()],[data.unit_title,null]]);
 container.append($e('h1',data.unit_title));
 note(container,'Beta de práctica · E3-A02 en revisión matemática, didáctica, curricular y de accesibilidad. No es material homologado.');
 const sec=$e('section','','card f1-section flow-lesson-index');
 sec.append($e('h2','Elige una de las seis lecciones'),
  $e('p','Empieza por la primera o selecciona el tema que necesites. Cada lección tiene cinco ejercicios.','hint'));
 const list=$e('ol','','flow-lesson-list');
 data.lesson_documents.forEach((d,i)=>{
   const li=$e('li'),title=unit?.lessons?.find(l=>l.lesson_id===d.lesson_id)?.title||d.lesson_id;
   const a=link('Lección '+(i+1)+': '+title,lessonUrl(d.lesson_id));
   append(li,a,$e('span',' · '+lessonItems(bank,d.lesson_id).length+' ejercicios','hint'));list.append(li);
 });
 sec.append(list);container.append(sec);
 section(container,'Objetivos de la unidad',data.unit_objectives.map((x,i)=>(i+1)+'. '+x).join('\n'));
 prerequisite(container,data);
 section(container,'Cómo estudiar y recordarlo','1. Lee y reproduce los ejemplos.\n2. Comprueba tu comprensión sin mirar.\n3. Practica los cinco ejercicios de cada lección.\n4. Repasa los errores y mezcla conceptos.\n5. Vuelve en días posteriores: no guardamos tu historial entre visitas.');
 container.append(link('Repasar en esta sesión','#/repaso-e3-a02'));
}
export function renderF1Lesson({container,data,bank,lessonId,title}){
 const doc=data.lesson_documents.find(x=>x.lesson_id===lessonId);
 if(!doc)return false;
 bread(container,[['Inicio','#/'],['3.º ESO',courseUrl()],['E3-A02',unitUrl()],[title,null]]);
 container.append($e('p',doc.lesson_id+' · Contenido F1 0.1.0 · En revisión','eyebrow'));
 container.append($e('h1',title));
  note(container,'Contenido beta en revisión. Los resultados se mantienen solo en memoria de esta pestaña y se pierden al recargar. Faltan revisiones curriculares y de accesibilidad.');
  const quick=$e('div','','flow-lesson-actions');
  const quickText=$e('p','Primero aprende con los ejemplos. Después resuelve cinco ejercicios con pistas.','hint');
  const jump=$e('button','Ir directamente a practicar','action');jump.type='button';
  jump.addEventListener('click',()=>{
    const h=container.querySelector('[data-practice-start]');
    h?.focus({preventScroll:false});
  });
  append(quick,quickText,jump);container.append(quick);
  section(container,'Hoy aprenderás',doc.objectives.map((x,i)=>(i+1)+'. '+x).join('\n'));
 const prs=$e('section','','card f1-section');prs.append($e('h2','Requisitos recomendados'));
 const ul=$e('ul');
 doc.prerequisites.forEach(id=>{const li=$e('li'),url=prereqUrl(id);li.append(url?link(id,url):$e('span',id));ul.append(li);});
 prs.append(ul);container.append(prs);
  container.append($e('p','PASO 1 · APRENDER','flow-inline-step'));
  renderBlocks(container,doc);
  container.append($e('p','PASO 2 · PRACTICAR','flow-inline-step'));
  practice(container,lessonItems(bank,lessonId),'Practica lo aprendido · 5 actividades');
 const after=$e('p','','f1-after');
 append(after,link('Volver a la unidad',unitUrl()),document.createTextNode(' · '),link('Repasar fallados y mezclar conceptos','#/repaso-e3-a02'));
 container.append(after);
 return true;
}
export function renderF1Review({container,data,bank}){
 const refresh=()=>{container.replaceChildren();renderF1Review({container,data,bank});};
 bread(container,[['Inicio','#/'],['E3-A02',unitUrl()],['Recuperación activa',null]]);
 container.append($e('h1','Recuperación activa · E3-A02'));
  note(container,'Paso 3 · Repasar: intenta resolver sin mirar los apuntes. Tus errores de esta sesión pueden ayudarte a elegir qué repetir; al recargar no se guarda ningún historial. La pauta D+1, D+3, D+7, D+14 y D+30 es solo orientativa.');
 localStorageStatus(container,refresh);
 const due=exerciseEngine.due();
 const all=exerciseEngine.progress.getStates();
 section(container,'Repaso durante esta sesión',
  'Preguntas programadas: '+Object.keys(all).length+' · Vencidas hoy: '+due.length+
  '\nLas fechas se perderán al cerrar o recargar la página; la pauta entre días es manual.');
 const fallback=data.lesson_documents.map(d=>lessonItems(bank,d.lesson_id)[0]).filter(Boolean);
 const selection=exerciseEngine.reviewDeck(fallback);
 const localizedItems=new Map(bank.activities.map(x=>[x.exercise_id,x]));
 const names={due:'Repaso espaciado pendiente',errors:'Reintenta actividades difíciles',mixed:'Reto mixto sin mirar apuntes'};
 const notes={due:'Tienes '+selection.items.length+' actividades cuyo repaso ha vencido. Recupera sin pistas.',
   errors:'Has tenido dificultad con '+selection.items.length+' actividad(es). Reinténtalas sin ayuda.',
   mixed:'No hay repasos vencidos ni fallos en esta sesión. Practica una selección intercalada de seis lecciones.'};
 section(container,'Repaso de dificultades',notes[selection.kind]);
 practice(container,selection.items.map(x=>localizedItems.get(x.exercise_id)||x),names[selection.kind]);
 container.append(link('Volver al índice de la unidad',unitUrl()));
}
