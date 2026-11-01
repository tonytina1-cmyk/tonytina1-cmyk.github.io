/* TBT tour pages: compact, accessible mobile detail sections. */
(function(){
  function init(){
    if(!window.matchMedia('(max-width: 760px)').matches)return;
  var style=document.createElement('style');
  style.textContent='@media(max-width:760px){main{padding-top:22px!important}main section.tbt-tour-compact-section{margin-top:12px!important;padding:0!important;background:transparent!important}main .tbt-tour-fold{display:block;border:1px solid #dfd3bf;border-radius:14px;background:#f8f3e9;margin:0;overflow:hidden}main .tbt-tour-fold>summary{display:list-item;cursor:pointer;list-style-position:inside;padding:16px 18px;font-size:17px;font-weight:750;line-height:1.3;color:#18352c}main .tbt-tour-fold[open]>summary{border-bottom:1px solid #dfd3bf}main .tbt-tour-fold-content{padding:6px 16px 18px}main .tbt-tour-fold-content p{margin:10px 0}main .tbt-tour-fold-content .cards{gap:10px}main .tbt-tour-fold-content .card{padding:14px}main .tbt-tour-fold-content .gallery img{height:175px}main .cta{margin-top:22px!important}main section{margin-top:24px}main .hero{gap:15px}main .hero h1{margin:7px 0 12px}main .hero .lead{font-size:17px;line-height:1.5}}';
  document.head.appendChild(style);
    var main=document.querySelector('main');
    if(!main)return;
    var sections=Array.from(main.querySelectorAll('section')).filter(function(s){return !s.closest('section');});
    sections.forEach(function(section,index){
      if(index===0 || section.classList.contains('cta') || section.querySelector('form') || section.querySelector('details') || section.querySelector('input,select,textarea') || section.querySelector('.btn.email') || section.querySelector('[href^="mailto:"]'))return;
      var heading=Array.from(section.children).find(function(el){return /^H[23]$/.test(el.tagName);});
      if(!heading || section.children.length<2)return;
      var details=document.createElement('details');
      details.className='tbt-tour-fold';
      var summary=document.createElement('summary');
      summary.textContent=heading.textContent.trim();
      summary.setAttribute('aria-label','Show '+heading.textContent.trim());
      details.appendChild(summary);
      var body=document.createElement('div');
      body.className='tbt-tour-fold-content';
      Array.from(section.childNodes).forEach(function(node){if(node!==heading)body.appendChild(node);});
      heading.remove();
      details.appendChild(body);
      section.appendChild(details);
      section.classList.add('tbt-tour-compact-section');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
