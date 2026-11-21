"use strict";
// Feedback stays on device until the visitor sends it through their own email client.
const form=document.getElementById("feedback-form");
const feedback=document.getElementById("feedback-text");
const lesson=document.getElementById("feedback-lesson");
const kind=document.getElementById("feedback-kind");
const status=document.getElementById("feedback-status");
const language=document.documentElement.lang==="ca"?"ca":"es";
const tr={
  es:{required:"Escribe un comentario de al menos 15 caracteres.",ready:"Se abrirá tu aplicación de correo. Revisa y envía el mensaje desde ella; WEB MATES no lo ha recibido todavía.",copied:"Mensaje copiado. Pégalo en un correo a gitmathlab@gmail.com.",copyFail:"No se pudo copiar automáticamente. Selecciona y copia el comentario manualmente.",subject:"Feedback WEB MATES beta E3-A02"},
  ca:{required:"Escriu un comentari d'almenys 15 caràcters.",ready:"S'obrirà l'aplicació de correu. Revisa i envia el missatge; WEB MATES encara no l'ha rebut.",copied:"Missatge copiat. Enganxa'l en un correu a gitmathlab@gmail.com.",copyFail:"No s'ha pogut copiar automàticament. Selecciona i copia el comentari manualment.",subject:"Comentaris WEB MATES beta E3-A02"}
}[language];
function compose(){
 const value=feedback.value.trim();
 if(value.length<15){status.textContent=tr.required;feedback.focus();return null;}
 const category=kind.options[kind.selectedIndex].textContent;
 const id=lesson.value.trim().slice(0,80)||"(no indicado / no indicat)";
 return tr.subject+"\n\nCategoría / Categoria: "+category+
  "\nUnidad / Unitat: E3-A02\nLección o ejercicio / Lliçó o exercici: "+id+
  "\n\n"+value.slice(0,2000)+
  "\n\n---\nBeta creada con IA / Beta creada amb IA\nNo enviar datos personales de menores / No enviar dades personals de menors";
}
form.addEventListener("submit",function(event){
 event.preventDefault();
 const body=compose();if(!body)return;
 const subject=encodeURIComponent(tr.subject+" · "+kind.value);
 window.location.href="mailto:gitmathlab@gmail.com?subject="+subject+"&body="+encodeURIComponent(body);
 status.textContent=tr.ready;
});
document.getElementById("feedback-copy").addEventListener("click",async function(){
 const body=compose();if(!body)return;
 try{
  await navigator.clipboard.writeText(body);
  status.textContent=tr.copied;
 }catch(_){status.textContent=tr.copyFail;feedback.focus();feedback.select();}
});
