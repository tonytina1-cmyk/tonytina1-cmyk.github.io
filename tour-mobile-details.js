/* TBT tour pages: compact, accessible mobile detail sections. */
(function(){
  function init(){
    if(!window.matchMedia('(max-width: 760px)').matches)return;
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
