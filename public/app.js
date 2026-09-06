const menu=document.querySelector('#menuButton'),nav=document.querySelector('#navLinks');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});
nav.addEventListener('click',event=>{if(event.target.closest('a')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
fetch('/api/status').then(response=>response.json()).then(status=>{document.querySelector('#networkState').textContent=`Block ${Number(status.height).toLocaleString()}`;document.querySelector('#networkDetail').textContent=status.networkId||'Planck testnet'}).catch(()=>{});
