// WEB MATES — motor matemático demostrativo aislado. SIN eval, Function ni red.
// Solo operaciones aritméticas y ejemplos lineales; NO altera el validador F2.
const LIMIT = 1e12;
const MAX_CHARS = 140;
const MAX_TOKENS = 100;
const MAX_DEPTH = 18;

function checked(v) {
  if (!Number.isFinite(v) || Math.abs(v) > LIMIT) {
    throw new Error('Resultado demasiado grande o no definido. Usa valores más pequeños.');
  }
  return Object.is(v, -0) ? 0 : v;
}

export function formatNumber(value, digits = 8) {
  if (!Number.isFinite(value)) return 'indefinido';
  const n = Object.is(value, -0) ? 0 : value;
  if (n !== 0 && Math.abs(n) < 1e-7) {
    return Number(n.toPrecision(9)).toString().replace('.', ',');
  }
  return Number(n.toFixed(digits)).toString().replace('.', ',');
}

export function parseFiniteExpression(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_CHARS) {
    throw new Error('Escribe una operación de hasta 140 caracteres.');
  }
  const src = raw.trim().replace(/[−–]/g, '-').replace(/[×·]/g, '*').replace(/[÷:]/g, '/');
  if (!src) throw new Error('Escribe una operación antes de calcular.');
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/u.test(ch)) { i++; continue; }
    if (/[0-9.,]/u.test(ch)) {
      const start = i;
      let dotCount = 0, digitCount = 0;
      while (i < src.length && /[0-9.,]/u.test(src[i])) {
        if (src[i] === ',' || src[i] === '.') dotCount++;
        else digitCount++;
        i++;
      }
      if (dotCount > 1 || digitCount === 0) {
        throw new Error('Usa un solo separador decimal: 2,5 o 2.5.');
      }
      const val = checked(Number(src.slice(start, i).replace(',', '.')));
      tokens.push({kind:'num', value:val});
    } else if ('()+-*/^'.includes(ch)) {
      tokens.push({kind:ch}); i++;
    } else if (ch === '√' || src.slice(i,i+4).toLowerCase() === 'sqrt') {
      tokens.push({kind:'sqrt'}); i += ch === '√' ? 1 : 4;
    } else {
      throw new Error('Símbolo no admitido. Usa números, +, −, ×, ÷, ^, paréntesis y √.');
    }
    if (tokens.length > MAX_TOKENS) throw new Error('Operación demasiado larga.');
  }
  let pos = 0;
  const peek = () => tokens[pos]?.kind;
  const take = kind => { if (peek() === kind) { pos++; return true; } return false; };
  function primary(depth) {
    if (depth > MAX_DEPTH) throw new Error('Demasiados paréntesis.');
    if (peek() === 'num') return tokens[pos++].value;
    if (take('(')) {
      const n = sum(depth+1);
      if (!take(')')) throw new Error('Falta cerrar un paréntesis.');
      return n;
    }
    if (take('sqrt')) {
      if (!take('(')) throw new Error('Escribe la raíz como √(9) o sqrt(9).');
      const n = sum(depth+1);
      if (!take(')')) throw new Error('Falta cerrar la raíz.');
      if (n < 0) throw new Error('No existe raíz cuadrada real de un número negativo.');
      return checked(Math.sqrt(n));
    }
    throw new Error('Falta un número o un paréntesis.');
  }
  function power(depth) {
    let a = primary(depth);
    if (take('^')) {
      const b = unary(depth+1);
      if (!Number.isInteger(b) || Math.abs(b) > 12) {
        throw new Error('El exponente debe ser un entero entre −12 y 12.');
      }
      if (a === 0 && b <= 0) throw new Error('No se puede elevar cero a cero o a un exponente negativo.');
      a = checked(a ** b);
    }
    return a;
  }
  function unary(depth) {
    if (depth > MAX_DEPTH) throw new Error('Operación demasiado anidada.');
    if (take('+')) return unary(depth+1);
    if (take('-')) return checked(-unary(depth+1));
    return power(depth);
  }
  function product(depth) {
    let v = unary(depth);
    while (peek() === '*' || peek() === '/') {
      const op = tokens[pos++].kind;
      const n = unary(depth);
      if (op === '/' && n === 0) throw new Error('No se puede dividir entre cero.');
      v = checked(op === '*' ? v*n : v/n);
    }
    return v;
  }
  function sum(depth) {
    let v = product(depth);
    while (peek() === '+' || peek() === '-') {
      const op = tokens[pos++].kind;
      const n = product(depth);
      v = checked(op === '+' ? v+n : v-n);
    }
    return v;
  }
  const result = sum(0);
  if (pos !== tokens.length) throw new Error('Revisa los símbolos y los paréntesis de la operación.');
  return checked(result);
}

export function quadraticSolution(a,b,c) {
  for (const n of [a,b,c]) {
    if (typeof n !== 'number' || !Number.isFinite(n) || Math.abs(n)>1e6) {
      throw new Error('Los coeficientes deben ser números de valor absoluto ≤ 1 000 000.');
    }
  }
  if (a === 0) throw new Error('a no puede ser cero: no sería una ecuación cuadrática.');
  const rawD = checked(b*b - 4*a*c);
  const magnitude = Math.max(1,Math.abs(b*b),Math.abs(4*a*c));
  const discriminant = Math.abs(rawD) < 1e-12*magnitude ? 0 : rawD;
  const steps = [
    'Ecuación: ('+formatNumber(a)+')x² + ('+formatNumber(b)+')x + ('+formatNumber(c)+') = 0.',
    'D = b² − 4ac = ('+formatNumber(b)+')² − 4·('+formatNumber(a)+')·('+formatNumber(c)+') = '+formatNumber(discriminant)+'.'
  ];
  if (discriminant < 0) {
    steps.push('D < 0: la ecuación no tiene raíces reales.');
    return {kind:'none',discriminant,roots:[],steps};
  }
  const sqrtD = Math.sqrt(discriminant);
  const denom = 2*a;
  const x1 = checked((-b + sqrtD)/denom);
  if (discriminant === 0) {
    steps.push('D = 0: una única raíz real doble. x = −b/(2a) = '+formatNumber(x1)+'.');
    steps.push('Comprueba sustituyendo x en ax² + bx + c.');
    return {kind:'double',discriminant,roots:[x1],steps};
  }
  const x2 = checked((-b - sqrtD)/denom);
  steps.push('D > 0: dos raíces reales. x = (−b ± √D)/(2a).');
  steps.push('x₁ ≈ '+formatNumber(x1)+' y x₂ ≈ '+formatNumber(x2)+'.');
  steps.push('Los decimales son aproximaciones; verifica sustituyendo ambas raíces.');
  return {kind:'two',discriminant,roots:[x1,x2],steps};
}

export const LINEAR_EXAMPLES = Object.freeze([
  Object.freeze({id:'l1',a:3,b:6,c:21,name:'3x + 6 = 21'}),
  Object.freeze({id:'l2',a:2,b:-4,c:10,name:'2x − 4 = 10'}),
  Object.freeze({id:'l3',a:-2,b:6,c:14,name:'−2x + 6 = 14'})
]);
function valueX(a) { return a === 1 ? 'x' : a === -1 ? '−x' : formatNumber(a)+'x'; }
function fmtSign(b) { return b > 0 ? ' + '+formatNumber(b) : b < 0 ? ' − '+formatNumber(-b) : ''; }
export function linearState(id,stage=0) {
  const item = LINEAR_EXAMPLES.find(e=>e.id===id);
  if (!item || ![0,1,2].includes(stage)) throw new Error('Ejemplo o paso no disponible.');
  const {a,b,c} = item;
  const rhs = c - b, solution = rhs/a;
  const first = valueX(a)+fmtSign(b)+' = '+formatNumber(c);
  const second = valueX(a)+' = '+formatNumber(rhs);
  const final = 'x = '+formatNumber(solution);
  if (stage === 0) return {
    item,stage,equation:first,term:(b>0?'+':'−')+formatNumber(Math.abs(b)),
    action:(b>0?'Restar ':'Sumar ')+formatNumber(Math.abs(b))+' a ambos lados',
    explanation:'Para quitar '+(b>0?'+'+formatNumber(b):'−'+formatNumber(-b))+
      ' del lado izquierdo, '+(b>0?'restamos ':'sumamos ')+formatNumber(Math.abs(b))+' a los dos miembros.',
    next:second,solution
  };
  if (stage === 1) return {
    item,stage,equation:second,term:valueX(a),
    action:'Dividir ambos lados entre '+formatNumber(a),
    explanation:'Dividimos los dos miembros entre '+formatNumber(a)+
      ' (nunca solo el lado izquierdo).',
    next:final,solution
  };
  return {item,stage,equation:final,term:'',action:'Resuelto',
    explanation:'Comprobación: ('+formatNumber(a)+') · ('+formatNumber(solution)+
      ') '+(b>=0?'+ ':'− ')+formatNumber(Math.abs(b))+' = '+formatNumber(c)+'.',
    next:final,solution
  };
}
export function advanceLinear(id,stage) {
  const before=linearState(id,stage);
  if(stage===2)return {before,after:before,explanation:'La ecuación ya está resuelta.'};
  const after=linearState(id,stage+1);
  return {before,after,explanation:before.explanation+' Resultado: '+after.equation};
}
