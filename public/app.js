const units = (n) => `${(Number(n) / 1e8).toLocaleString(undefined, { maximumFractionDigits: 2 })} KRK`;
async function refresh() {
  const [status, blocks] = await Promise.all([fetch("/api/status").then(r=>r.json()), fetch("/api/blocks").then(r=>r.json())]);
  height.textContent=status.height; issued.textContent=units(status.issued); crypto.textContent=status.crypto;
  document.querySelector("#blocks").innerHTML=blocks.map(b=>`<article class="block"><b>#${b.height}</b><code>${b.hash}</code><span>${units(b.reward||0)}</span></article>`).join("");
}
gpu.textContent = navigator.gpu ? "WebGPU detected — compatible GPU browser" : "WebGPU unavailable — CPU test mode";
walletButton.onclick=async()=>{ const w=await fetch("/api/wallet",{method:"POST"}).then(r=>r.json()); address.value=w.address; walletResult.textContent=`Address: ${w.address}\nA private test wallet file is downloading.`; const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(w,null,2)],{type:"application/json"}));a.download=`korek-wallet-${w.address.slice(-8)}.json`;a.click();URL.revokeObjectURL(a.href); };
mineButton.onclick=async()=>{ mineButton.disabled=true; mineResult.textContent="Mining…"; const r=await fetch("/api/mine",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({address:address.value})}).then(r=>r.json());mineResult.textContent=r.error||`Block #${r.height}\n${r.hash}\nReward: ${units(r.reward)}`;mineButton.disabled=false;refresh(); };
refresh();setInterval(refresh,5000);
