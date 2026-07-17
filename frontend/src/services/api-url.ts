// Resolve o URL base da API a partir de NEXT_PUBLIC_API_URL (inlined no build).
//
// Defesa contra Mixed Content: se a pagina for servida por HTTPS mas o URL da
// API estiver em HTTP (tipicamente por NEXT_PUBLIC_API_URL mal configurado no
// build de producao), promove o esquema para HTTPS. Hosts locais de
// desenvolvimento (localhost/127.0.0.1) sao mantidos em HTTP.
export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    configured.startsWith("http://")
  ) {
    try {
      const url = new URL(configured);
      if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
        url.protocol = "https:";
        const upgraded = url.toString().replace(/\/$/, "");
        // #region agent log
        fetch('http://127.0.0.1:7673/ingest/d668e149-f66e-4783-964b-7e2f59b719d6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2cba02'},body:JSON.stringify({sessionId:'2cba02',runId:'post-fix',hypothesisId:'A',location:'services/api-url.ts:resolveApiBaseUrl',message:'API baseURL upgraded http->https',data:{configured,upgraded,pageProtocol:window.location.protocol},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return upgraded;
      }
    } catch {
      // URL invalido: usa o valor configurado tal como esta.
    }
  }

  // #region agent log
  if (typeof window !== "undefined") {
    fetch('http://127.0.0.1:7673/ingest/d668e149-f66e-4783-964b-7e2f59b719d6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2cba02'},body:JSON.stringify({sessionId:'2cba02',runId:'post-fix',hypothesisId:'A',location:'services/api-url.ts:resolveApiBaseUrl',message:'API baseURL resolved (sem upgrade)',data:{configured,pageProtocol:window.location.protocol},timestamp:Date.now()})}).catch(()=>{});
  }
  // #endregion

  return configured;
}
