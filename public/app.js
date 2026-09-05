const units = (n) => `${(Number(n) / 1e8).toLocaleString(undefined, { maximumFractionDigits: 2 })} KRK`;
const elements = {
  height: document.querySelector("#height"), issued: document.querySelector("#issued"),
  crypto: document.querySelector("#crypto"), blocks: document.querySelector("#blocks"),
  gpu: document.querySelector("#gpu"), address: document.querySelector("#address"),
  mineButton: document.querySelector("#mineButton"), mineResult: document.querySelector("#mineResult"),
  walletButton: document.querySelector("#walletButton"), walletResult: document.querySelector("#walletResult"),
};

async function request(path, options) {
  const response = await fetch(path, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
  return result;
}

async function refresh() {
  try {
    const [status, blocks] = await Promise.all([request("/api/status"), request("/api/blocks")]);
    elements.height.textContent=status.height; elements.issued.textContent=units(status.issued); elements.crypto.textContent=status.crypto;
    elements.blocks.innerHTML=blocks.map(b=>`<article class="block"><b>#${b.height}</b><code>${b.hash}</code><span>${units(b.reward||0)}</span></article>`).join("");
  } catch (error) {
    elements.blocks.textContent = `Node unavailable: ${error.message}`;
  }
}
elements.gpu.textContent = navigator.gpu ? "WebGPU detected — compatible GPU browser" : "WebGPU unavailable — CPU test mode";
elements.walletButton.addEventListener("click", async () => {
  elements.walletButton.disabled=true; elements.walletResult.textContent="Creating wallet…";
  try {
    const wallet=await request("/api/wallet",{method:"POST"}); elements.address.value=wallet.address;
    const blobUrl=URL.createObjectURL(new Blob([JSON.stringify(wallet,null,2)],{type:"application/json"}));
    const link=document.createElement("a"); link.href=blobUrl; link.download=`korek-wallet-${wallet.address.slice(-8)}.json`;
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(blobUrl),1000);
    elements.walletResult.textContent=`Wallet created\nAddress: ${wallet.address}\nPrivate test wallet downloaded. Keep it secret.`;
  } catch(error) { elements.walletResult.textContent=`Wallet error: ${error.message}`; }
  finally { elements.walletButton.disabled=false; }
});
elements.mineButton.addEventListener("click", async () => {
  elements.mineButton.disabled=true; elements.mineResult.textContent="Mining…";
  try {
    const block=await request("/api/mine",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({address:elements.address.value.trim()})});
    elements.mineResult.textContent=`Block #${block.height}\n${block.hash}\nReward: ${units(block.reward)}`; await refresh();
  } catch(error) { elements.mineResult.textContent=`Mining error: ${error.message}`; }
  finally { elements.mineButton.disabled=false; }
});
refresh();setInterval(refresh,5000);
