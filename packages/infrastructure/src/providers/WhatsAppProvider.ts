export class WhatsAppProvider {
  /**
   * Envía un mensaje de texto puro vía WhatsApp Cloud API
   */
  async sendTextMessage(phoneNumberId: string, token: string, toPhone: string, text: string) {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    
    console.log(`[WhatsApp Real] Enviando a ${toPhone} vía ${phoneNumberId}...`);
    
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: toPhone,
      type: "text",
      text: { 
        preview_url: false,
        body: text
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("[WhatsApp Error]", data);
      throw new Error(data?.error?.message || "Error al enviar mensaje vía WhatsApp");
    }

    return data?.messages?.[0]?.id; // Retorna wamid
  }

  /**
   * Descarga un media blob (audio, imagen) desde los servidores de Meta.
   */
  async downloadMedia(mediaId: string, waToken: string): Promise<{ buffer: Buffer, mimeType: string }> {
    // 1. Obtener la URL temporal
    const urlMeta = `https://graph.facebook.com/v19.0/${mediaId}`;
    const resMeta = await fetch(urlMeta, { headers: { "Authorization": `Bearer ${waToken}` }});
    const dataMeta = await resMeta.json();
    
    if (!resMeta.ok || !dataMeta.url) {
       throw new Error("No se pudo obtener URL del media en WhatsApp Meta.");
    }
    
    // 2. Descargar el archivo con el Bearer token
    const resBinary = await fetch(dataMeta.url, { headers: { "Authorization": `Bearer ${waToken}` }});
    if (!resBinary.ok) throw new Error("Fallo al descargar el arraybuffer visual de Meta");

    const arrayBuffer = await resBinary.arrayBuffer();
    const mimeType = resBinary.headers.get("content-type") || dataMeta.mime_type || "audio/ogg";

    return {
       buffer: Buffer.from(arrayBuffer),
       mimeType
    };
  }
}
