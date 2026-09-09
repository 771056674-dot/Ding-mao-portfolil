const grid = document.querySelector('#work-grid');
const dialog = document.querySelector('#project-dialog');
const labels = {brand:'品牌视觉',creative:'创意探索',ui:'UI / 产品'};
let lastProjectButton;
function openProject(project, button) {
  lastProjectButton = button;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-category').textContent = labels[project.category] + ' / ' + project.year;
  document.querySelector('#dialog-description').textContent = project.description || (project.images.length ? '当前展示为本地作品图片。项目背景、设计思路、职责与成果将在这里补充。' : '这里预留给你的 UI / 产品设计项目。后续可以加入项目封面、设计过程与最终成果。');
  const gallery = document.querySelector('#dialog-gallery');
  gallery.replaceChildren();
  if (!project.images.length) { const empty = document.createElement('div'); empty.className = 'dialog-placeholder'; empty.textContent = '新作品，敬请期待。'; gallery.append(empty); }
  project.images.forEach((image, i) => {const img = document.createElement('img'); img.src = `assets/${image}.webp`; img.alt = `${project.title} — 作品 ${i+1}`; img.loading = 'lazy'; gallery.append(img);});
  dialog.showModal(); dialog.scrollTop = 0; document.body.classList.add('modal-open');
}
let galleryItems = [];
let orbitOffset = 0;
let galleryView = 'orbit';
const galleryTitle = document.querySelector('#gallery-title');
const galleryMeta = document.querySelector('#gallery-meta');
function resetGalleryLabel() {
  galleryTitle.textContent = '创意，自有轨迹。';
  galleryMeta.textContent = `${String(galleryItems.length).padStart(2, '0')} VISUALS / SELECTED WORK`;
}
function positionOrbit() {
  const cards = [...grid.children];
  cards.forEach((card, i) => {
    const angle = ((i / cards.length) * Math.PI * 2) - Math.PI / 2 + orbitOffset;
    const x = Math.cos(angle) * 34;
    const y = Math.sin(angle) * 26 + Math.cos(angle) * -7;
    card.style.setProperty('--x', `${50 + x}%`);
    card.style.setProperty('--y', `${50 + y}%`);
    card.style.setProperty('--depth', String(Math.round(20 + Math.sin(angle) * 10)));
    card.style.setProperty('--size', String(.88 + (Math.sin(angle) + 1) * .085));
  });
}
function renderProjects(filter = 'all') {
  grid.replaceChildren(); orbitOffset = 0;
  galleryItems = portfolio.projects.filter(project => filter === 'all' || project.category === filter)
    .flatMap(project => (project.images.length ? project.images : [null]).map((image, imageIndex) => ({project, image, imageIndex})));
  galleryItems.forEach(({project, image, imageIndex}, index) => {
    const card = document.createElement('article'); card.className = 'orbit-card';
    const button = document.createElement('button'); button.className = 'visual-button';
    button.setAttribute('aria-label', `查看${project.title}${image ? `，海报 ${imageIndex + 1}` : ''}`);
    if(image) {
      const img = document.createElement('img'); img.src = `assets/${image}.webp`; img.alt = `${project.title} — 海报 ${imageIndex + 1}`; img.loading = 'lazy'; button.append(img);
    } else {
      const placeholder = document.createElement('span'); placeholder.className = 'orbit-placeholder';
      const symbol = document.createElement('span'); symbol.textContent = '＋';
      const caption = document.createElement('small'); caption.textContent = 'NEXT PROJECT'; placeholder.append(symbol, caption); button.append(placeholder);
    }
    const caption = document.createElement('span'); caption.className = 'visual-caption';
    const number = document.createElement('small'); number.textContent = String(index + 1).padStart(2,'0');
    const title = document.createElement('span'); title.textContent = project.title;
    const arrow = document.createElement('span'); arrow.textContent = '↗'; caption.append(number,title,arrow); button.append(caption);
    const highlight = () => {galleryTitle.textContent = project.title; galleryMeta.textContent = `${labels[project.category]} / ${project.year}`; card.classList.add('highlighted');};
    const unhighlight = () => {card.classList.remove('highlighted');resetGalleryLabel();};
    button.addEventListener('pointerenter',highlight);button.addEventListener('pointerleave',unhighlight);
    button.addEventListener('focus',highlight);button.addEventListener('blur',unhighlight);
    button.addEventListener('click',()=>{
      // 将点击的海报置于预览首位，其余同项目作品随后展示。
      const images = image ? [image,...project.images.filter(item => item !== image)] : [];
      openProject({...project,images},button);
    });
    card.append(button);grid.append(card);
  });
  resetGalleryLabel();positionOrbit();
}
const galleryStage = document.querySelector('.gallery-stage');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let pointerFrame = 0;
galleryStage.addEventListener('pointermove',event=>{
  if(event.pointerType !== 'mouse' || motionPreference.matches || galleryView !== 'orbit')return;
  if(pointerFrame)cancelAnimationFrame(pointerFrame);
  pointerFrame=requestAnimationFrame(()=>{const rect=galleryStage.getBoundingClientRect();grid.style.setProperty('--drift-x',`${(event.clientX-rect.left-rect.width/2)*.016}px`);grid.style.setProperty('--drift-y',`${(event.clientY-rect.top-rect.height/2)*.016}px`);});
});
galleryStage.addEventListener('pointerleave',()=>{cancelAnimationFrame(pointerFrame);grid.style.setProperty('--drift-x','0px');grid.style.setProperty('--drift-y','0px');});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  galleryView=button.dataset.view;galleryStage.classList.toggle('is-grid',galleryView==='grid');
  document.querySelectorAll('[data-view]').forEach(item=>{const selected=item===button;item.setAttribute('aria-pressed',String(selected));item.classList.toggle('selected',selected);});
}));
document.querySelectorAll('[data-orbit-step]').forEach(button=>button.addEventListener('click',()=>{orbitOffset+=Number(button.dataset.orbitStep)*Math.PI*2/Math.max(galleryItems.length,1);positionOrbit();}));

renderProjects();
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(item=>{const selected=item===button;item.classList.toggle('selected',selected);item.setAttribute('aria-pressed',String(selected));});renderProjects(button.dataset.filter);}));
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');lastProjectButton?.focus({preventScroll:true});});
const header=document.querySelector('.header');const menu=document.querySelector('.menu-toggle');
menu.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'关闭导航菜单':'打开导航菜单');menu.querySelector('span').textContent=open?'−':'＋';});
document.querySelectorAll('.header nav a').forEach(link=>link.addEventListener('click',()=>{header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','打开导航菜单');menu.querySelector('span').textContent='＋';}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&header.classList.contains('menu-open'))menu.click();});
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window){const reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('pending');reveals.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(item=>{if(!reduced.matches){item.classList.add('pending');reveals.observe(item);}});}
let scrollTick=false;
function updateScroll(){const sections=['home','info','works','about'];let current='home';for(const id of sections){if(document.getElementById(id).getBoundingClientRect().top<innerHeight*.45)current=id;}document.querySelectorAll('.header nav a').forEach(link=>{const active=link.hash===`#${current}`;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});if(!reduced.matches&&innerWidth>640)document.querySelector('.hero-frame').style.setProperty('--hero-scale',1+Math.min(scrollY/15000,.035));scrollTick=false;}
window.addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(updateScroll);}},{passive:true});updateScroll();
if(portfolio.email){const contact=document.createElement('a');contact.className='contact-placeholder';contact.href=`mailto:${portfolio.email}`;contact.textContent=portfolio.email+' ↗';document.querySelector('#contact-detail').replaceWith(contact);}
