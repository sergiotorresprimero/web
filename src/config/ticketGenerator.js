import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

export async function generarBlobTicket(datosTicket) {
  try {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    const qrText = JSON.stringify({
      id: datosTicket.id || 'N/A',
      nombre: datosTicket.nombre_completo,
      tel: datosTicket.telefono
    });

    const qrDataUrl = await QRCode.toDataURL(qrText, {
      width: 400,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    const congregacionTexto = datosTicket.congregacion === 'Otra' ? datosTicket.otra_congregacion : datosTicket.congregacion;
    const ticketIdCorto = datosTicket.id ? `CONG26-${datosTicket.id.toString().slice(0, 6).toUpperCase()}` : 'CONG26-VIP';

    container.innerHTML = `
      <div style="width: 460px; background: #07090e; border-radius: 32px; padding: 40px 30px; color: white; font-family: system-ui, -apple-system, sans-serif; box-shadow: 0 30px 60px rgba(0,0,0,0.9); position: relative; box-sizing: border-box; border: 1px solid rgba(255,255,255,0.08); overflow: hidden;">
        
        <!-- Título Principal y Subtítulo con los tonos del Hero -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 32px; font-weight: 900; letter-spacing: -0.025em; color: #ffffff; text-transform: uppercase; line-height: 1;">CONGRESO</div>
          <div style="font-size: 48px; font-weight: 900; letter-spacing: -0.025em; color: #ffffff; line-height: 1.1; margin-top: 4px;">2026</div>
          <div style="font-size: 18px; color: #fef08a; font-weight: 800; margin-top: 10px; text-shadow: 0 2px 8px rgba(250,204,21,0.3);">El Siglo del Espíritu Santo</div>
        </div>

        <!-- Datos del Asistente -->
        <div style="margin-bottom: 30px; text-align: center;">
          <div style="font-size: 10px; color: #94a3b8; font-weight: 800; letter-spacing: 2px;">ASISTENTE</div>
          <div style="font-size: 22px; font-weight: 900; color: #ffffff; margin-top: 4px; word-break: break-word;">${datosTicket.nombre_completo || 'N/A'}</div>
          
          <div style="font-size: 10px; color: #94a3b8; font-weight: 800; letter-spacing: 2px; margin-top: 14px;">CONGREGACIÓN</div>
          <div style="font-size: 14px; font-weight: bold; color: #cbd5e1; margin-top: 2px;">${congregacionTexto || 'N/A'}</div>
        </div>

        <!-- Código QR Central -->
        <div style="display: flex; justify-content: center; margin: 20px 0 10px 0;">
          <div style="background: white; padding: 12px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <img src="${qrDataUrl}" style="display: block; width: 170px; height: 170px;" />
          </div>
        </div>

        <div style="text-align: center; font-size: 12px; font-weight: 800; color: #94a3b8; letter-spacing: 1.5px; margin-bottom: 30px;">
          ${ticketIdCorto}
        </div>

        <!-- Talón Inferior con Bordes Continuos -->
        <div style="margin: 0 -30px -40px -30px; background: linear-gradient(135deg, #059669, #10b981, #06b6d4); border-radius: 0 0 32px 32px; padding: 22px 18px; text-align: center;">
          <div style="font-size: 13px; font-weight: 900; color: #020617; letter-spacing: 3px; text-transform: uppercase;">
            TICKET VIRTUAL
          </div>
        </div>

      </div>
    `;

    const canvas = await html2canvas(container.firstElementChild, {
      scale: 2, // Reducido de 3 a 2 para mayor velocidad de renderizado
      useCORS: true,
      backgroundColor: null
    });

    document.body.removeChild(container);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          qrDataUrl
        });
      }, 'image/png', 1.0);
    });

  } catch (error) {
    console.error('Error generando ticket:', error);
    return null;
  }
}