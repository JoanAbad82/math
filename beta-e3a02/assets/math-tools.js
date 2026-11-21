// WEB MATES — herramientas opcionales para el alumno (sin persistencia/servicios externos).
import {formatNumber,parseFiniteExpression,quadraticSolution,
        LINEAR_EXAMPLES,linearState,advanceLinear} from './math-engine.js';

const el=(name,text='',className='')=>{
  const node=document.createElement(name);
  if (text !== '') node.textContent=text;
  if (className) node.className=className;
  return node;
};
const append=(node,...items)=>{node.append(...items);return node;};
function labelField(id,caption,value){
  const group=el('div','','wm-field');
  const label=el('label',caption);label.htmlFor=id;
  const input=el('input');
  input.type='text';input.id=id;input.value=value;input.autocomplete='off';
  input.spellcheck=false;input.inputMode='decimal';input.maxLength=140;
  group.append(label,input);
  return {group,input};
}
function output(className){
  const node=el('div','','wm-output '+className);
  node.setAttribute('role','status');
  node.setAttribute('aria-live','polite');
  node.setAttribute('aria-atomic','true');
  return node;
}
function setOutput(node,text,isError=false){
  node.textContent=text;
  node.classList.toggle('wm-error',isError);
}
function insertInExercise(practice,value,status){
  const input=practice.querySelector('input[type="text"]');
  if (!input) {
    setOutput(status,'Esta actividad no tiene respuesta numérica. Puedes usar el cálculo como ayuda, sin copiarlo.');
    return false;
  }
  input.value=value;
  input.dispatchEvent(new Event('input',{bubbles:true}));
  input.focus();
  setOutput(status,'Resultado colocado en «Tu respuesta». Pulsa «Comprobar» cuando hayas revisado el procedimiento.');
  return true;
}
function calculator(practice){
  const detail=el('details','','wm-tool-section');detail.open=true;
  detail.dataset.tool='calculator';
  detail.append(el('summary','Calculadora y discriminante'));
  const body=el('div','','wm-tool-body');
  const info=el('p','Para operaciones, potencias, raíces y discriminantes. Introduce los datos y comprueba el procedimiento.','wm-muted');
  const f=el('form','','wm-calc-form');f.noValidate=true;
  const {group:exprGroup,input:expr}=labelField('wm-expression','Operación (por ejemplo: (−6)^2 − 4×1×9)','(-6)^2-4*1*9');
  expr.dataset.calc='expression';expr.inputMode='text';
  expr.setAttribute('aria-describedby','wm-calc-hint');expr.maxLength=140;
  const hint=el('p','Admite +, −, ×, ÷, ^, paréntesis y √(n). Coma o punto decimal. No admite letras ni código.','wm-muted');
  hint.id='wm-calc-hint';
  const pad=el('div','','wm-keypad');pad.setAttribute('role','group');
  pad.setAttribute('aria-label','Teclado de la calculadora');
  for(const key of ['7','8','9','÷','⌫','4','5','6','×','(', '1','2','3','−',')','0',',','√','+','^','C','=']){
    const button=el('button',key,'wm-key');
    button.type=key==='='?'submit':'button';
    button.dataset.key=key;
    const labels={'⌫':'Borrar último símbolo','C':'Vaciar operación','√':'Insertar raíz cuadrada',
      '^':'Potencia','×':'Multiplicar','÷':'Dividir','−':'Restar',',':'Separador decimal',
      '=':'Calcular operación'};
    button.setAttribute('aria-label',labels[key]||'Introducir '+key);
    if(key==='=')button.classList.add('wm-key-action');
    button.addEventListener('click',()=>{
      if(key==='=')return;
      if(key==='C'){expr.value='';expr.dispatchEvent(new Event('input',{bubbles:true}));expr.focus();return;}
      const start=expr.selectionStart??expr.value.length;
      const end=expr.selectionEnd??start;
      if(key==='⌫'){
        if(start===end&&start===0){expr.focus();return;}
        const from=start===end?start-1:start;
        expr.setRangeText('',from,end,'start');
      }else{
        expr.setRangeText(key==='√'?'√(':key,start,end,'end');
      }
      expr.dispatchEvent(new Event('input',{bubbles:true}));
      expr.focus();
    });
    pad.append(button);
  }
  const calcOut=output('wm-calc-result');
  const answer=el('button','Usar resultado en la respuesta','wm-tool-action');
  answer.type='button';answer.dataset.calc='use-result';answer.disabled=true;
  const status=output('wm-tool-notice');
  let last=null;
  expr.addEventListener('input',()=>{last=null;answer.disabled=true;calcOut.replaceChildren();});
  f.addEventListener('submit',event=>{
    event.preventDefault();
    try{
      last=parseFiniteExpression(expr.value);
      setOutput(calcOut,'Resultado: '+formatNumber(last));
      answer.disabled=false;
    }catch(err){
      last=null;answer.disabled=true;
      setOutput(calcOut,'No se pudo calcular: '+err.message,true);
    }
  });
  answer.addEventListener('click',()=>{
    if(last!==null)insertInExercise(practice,formatNumber(last),status);
  });
  append(f,exprGroup,hint,pad,calcOut,answer,status);
  const q=el('section','','wm-quadratic');
  const h3=el('h3','Ecuación cuadrática: ax² + bx + c = 0');
  const blurb=el('p','Para calcular D = b² − 4ac y las raíces reales, introduce a, b y c.','wm-muted');
  const quadForm=el('form','','wm-quad-form');quadForm.noValidate=true;
  const fields=el('div','','wm-quad-fields');
  const inputs=[];
  for(const [id,title,defaultVal] of [['a','a','1'],['b','b','-6'],['c','c','9']]){
    const {group,input}=labelField('wm-quad-'+id,title,defaultVal);
    input.dataset.coef=id;fields.append(group);inputs.push(input);
  }
  const solve=el('button','Calcular D y raíces','wm-tool-action');
  solve.type='submit';solve.dataset.calc='solve-quadratic';
  const eqOut=output('wm-quad-result');
  const useD=el('button','Usar D en la respuesta','wm-tool-action');
  useD.type='button';useD.disabled=true;useD.dataset.calc='use-D';
  const useRoots=el('button','Usar raíces en la respuesta','wm-tool-action');
  useRoots.type='button';useRoots.disabled=true;useRoots.dataset.calc='use-roots';
  let solved=null;
  inputs.forEach(input=>input.addEventListener('input',()=>{
    solved=null;useD.disabled=true;useRoots.disabled=true;eqOut.replaceChildren();
  }));
  quadForm.addEventListener('submit',event=>{
    event.preventDefault();eqOut.replaceChildren();
    try{
      const coeffs=inputs.map(i=>parseFiniteExpression(i.value));
      solved=quadraticSolution(...coeffs);
      const list=el('ol','','wm-steps');
      for(const step of solved.steps)list.append(el('li',step));
      eqOut.append(list);
      eqOut.classList.remove('wm-error');
      useD.disabled=false;useRoots.disabled=solved.roots.length===0;
    }catch(err){
      solved=null;useD.disabled=true;useRoots.disabled=true;
      setOutput(eqOut,'No se pudo resolver: '+err.message,true);
    }
  });
  useD.addEventListener('click',()=>{
    if(solved)insertInExercise(practice,formatNumber(solved.discriminant),status);
  });
  useRoots.addEventListener('click',()=>{
    if(solved?.roots.length)insertInExercise(practice,solved.roots.map(n=>formatNumber(n)).join('; '),status);
  });
  append(quadForm,fields,solve,eqOut,useD,useRoots);
  append(q,h3,blurb,quadForm);
  append(body,info,f,q);
  detail.append(body);
  return detail;
}

function linearLab(){
  const detail=el('details','','wm-tool-section');
  detail.dataset.tool='linear-lab';
  detail.append(el('summary','Mover términos: ecuación lineal'));
  const body=el('div','','wm-tool-body');
  body.append(el('p','Laboratorio de prerrequisitos (no cuenta entre los 30 ejercicios). El objetivo es mantener la igualdad al operar en ambos lados.','wm-muted'));
  const label=el('label','Elige un ejemplo lineal');
  label.htmlFor='wm-linear-example';
  const select=el('select');select.id='wm-linear-example';select.dataset.linear='example';
  for(const ex of LINEAR_EXAMPLES){
    const opt=el('option',ex.name);opt.value=ex.id;select.append(opt);
  }
  const equation=output('wm-equation');equation.dataset.linear='equation';
  const sides=el('div','','wm-balance');sides.setAttribute('role','group');
  sides.setAttribute('aria-label','Dos miembros de una ecuación');
  const left=el('div','','wm-side wm-left');
  const right=el('div','','wm-side wm-right');
  const guide=el('p','','wm-muted');
  const actions=el('div','','wm-lab-actions');
  const apply=el('button','','wm-tool-action');apply.type='button';apply.dataset.linear='apply';
  const undo=el('button','Deshacer paso','wm-tool-action wm-secondary');undo.type='button';undo.dataset.linear='undo';
  const reset=el('button','Reiniciar','wm-tool-action wm-secondary');reset.type='button';reset.dataset.linear='reset';
  const status=output('wm-linear-status');status.dataset.linear='feedback';
  const trail=el('ol','','wm-steps');trail.dataset.linear='steps';
  let stage=0;
  const example=()=>select.value;
  const step=()=>linearState(example(),stage);
  function perform(){
    if(stage>=2)return;
    const transition=advanceLinear(example(),stage);
    stage++;
    render();
    setOutput(status,transition.explanation);
    const item=el('li',transition.explanation);
    trail.append(item);
    apply.focus({preventScroll:true});
  }
  function render(){
    const view=step();
    setOutput(equation,'Ecuación: '+view.equation);
    left.replaceChildren();right.replaceChildren();
    left.append(el('h4','Primer miembro'));
    right.append(el('h4','Segundo miembro'));
    if(stage===0){
      const a=view.item.a;
      left.append(el('span',(a===1?'x':a===-1?'−x':formatNumber(a)+'x'),'wm-term-variable'));
      const token=el('button',view.term,'wm-term');
      token.type='button';token.dataset.linear='drag-term';
      token.setAttribute('aria-label','Término '+view.term+'. Pulsa para aplicar la operación inversa en ambos lados o arrastra a la derecha.');
      token.title='Arrastra o pulsa para operar en ambos lados';
      const zone=el('div','','wm-drop');
      zone.dataset.linear='drop';
      zone.setAttribute('aria-label','Zona derecha para soltar el término');
      zone.append(el('span',formatNumber(view.item.c)),
        el('small','Suelta aquí el término para ver la operación inversa'));
      const performOnce=()=>{if(stage===0)perform()};
      const inDrop=(x,y)=>{
        const r=zone.getBoundingClientRect();
        return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
      };
      // Pointer Events con captura: el término acompaña al ratón o dedo.
      // Los botones siguen ofreciendo operación completa sin arrastrar.
      let started=null,suppressClick=false,hovering=false;
      const clearDrag=()=>{
        token.style.transform='';
        token.classList.remove('wm-dragging');
        zone.classList.remove('wm-drop-active');
        hovering=false;
      };
      token.addEventListener('click',()=>{
        if(suppressClick){suppressClick=false;return;}
        performOnce();
      });
      token.addEventListener('pointerdown',ev=>{
        if(stage!==0)return;
        started={x:ev.clientX,y:ev.clientY};
        try{token.setPointerCapture(ev.pointerId)}catch(_){/* synthetic test event */}
      });
      token.addEventListener('pointermove',ev=>{
        if(!started)return;
        const dx=ev.clientX-started.x,dy=ev.clientY-started.y;
        if(Math.hypot(dx,dy)<=12)return;
        token.classList.add('wm-dragging');
        token.style.transform='translate('+dx+'px,'+dy+'px)';
        const over=inDrop(ev.clientX,ev.clientY);
        if(over!==hovering){
          hovering=over;zone.classList.toggle('wm-drop-active',over);
          if(over)setOutput(status,'Al soltar: '+view.action+'. '+view.next);
        }
      });
      token.addEventListener('pointerup',ev=>{
        if(!started)return;
        const moved=Math.hypot(ev.clientX-started.x,ev.clientY-started.y)>12;
        started=null;clearDrag();
        if(token.hasPointerCapture(ev.pointerId))token.releasePointerCapture(ev.pointerId);
        if(!moved)return;
        suppressClick=true;
        if(inDrop(ev.clientX,ev.clientY))performOnce();
        else setOutput(status,'No se ha cambiado la igualdad. Suelta el término en el segundo miembro o utiliza el botón.');
      });
      token.addEventListener('pointercancel',()=>{
        started=null;clearDrag();
      });
      left.append(token);right.append(zone);
      guide.textContent='Arrastra el término '+view.term+' al segundo miembro o pulsa el botón. Verás la operación aplicada a ambos lados.';
    }else{
      left.append(el('span',stage===1?view.item.a+'x':'x','wm-term-variable'));
      right.append(el('span',stage===1?formatNumber(view.item.c-view.item.b):formatNumber(view.solution),'wm-term-number'));
      guide.textContent=stage===1?'Ahora hay que quitar el coeficiente de x, dividiendo ambos miembros.':
        'Resuelto. Sustituye el valor para comprobar la igualdad.';
    }
    apply.textContent=view.action;
    apply.disabled=stage===2;
    undo.disabled=stage===0;
    if(stage===2)setOutput(status,view.explanation);
  }
  apply.addEventListener('click',perform);
  undo.addEventListener('click',()=>{
    if(stage===0)return;
    stage--;trail.lastElementChild?.remove();render();
    setOutput(status,'Paso deshecho. Ecuación actual: '+step().equation);
    apply.focus({preventScroll:true});
  });
  reset.addEventListener('click',()=>{stage=0;trail.replaceChildren();render();setOutput(status,'Ejemplo reiniciado.')});
  select.addEventListener('change',()=>{stage=0;trail.replaceChildren();render();setOutput(status,'Nuevo ejemplo: '+step().equation)});
  actions.append(apply,undo,reset);
  append(sides,left,right);
  append(body,label,select,equation,sides,guide,actions,status,el('h4','Transformaciones realizadas'),trail);
  detail.append(body);
  render();
  return detail;
}
export function mountMathTools(container){
  const practice=container.querySelector('.f1-practice');
  if(!practice || container.querySelector('.wm-practice-layout'))return false;
  const layout=el('div','','wm-practice-layout');
  const aside=el('aside','','wm-tools-aside');
  aside.setAttribute('aria-label','Herramientas opcionales para resolver ejercicios');
  const panel=el('details','','wm-tools-panel');
  panel.dataset.tool='panel';
  // Mobile stays compact; desktop offers tools alongside practice without extra navigation.
  panel.open=window.matchMedia('(min-width:980px)').matches;
  panel.append(el('summary','Herramientas: calculadora y mover términos'));
  const panelBody=el('div','','wm-tools-panel-body');
  panelBody.append(el('p','Estas herramientas ayudan a razonar, pero la respuesta del ejercicio se comprueba por separado. No guardan datos.','wm-muted'));
  panelBody.append(calculator(practice),linearLab());
  panel.append(panelBody);aside.append(panel);
  practice.replaceWith(layout);
  layout.append(aside,practice);
  return true;
}
