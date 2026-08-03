<script>
  import {
    CONGREGACION_OPCIONES,
    enviarInscripcion,
    crearEstadoFormularioVacio,
  } from '../../config/formularioCongreso.js';
  
  import QRCode from 'qrcode';

  let form = crearEstadoFormularioVacio();
  let cargando = false;
  let mostrarOverlay = false;
  let errorMensaje = '';
  let datosTicket = null;
  let qrDataUrl = '';
  let ticketElementRef;
  let procesandoAccion = false;

  async function handleSubmit(event) {
    event.preventDefault();
    cargando = true;
    errorMensaje = '';

    try {
      const { data, error } = await enviarInscripcion(form, {
        estadoAsistencia: 'pendiente',
      });

      if (error) {
        console.error('Error al insertar:', error);
        errorMensaje = error.message || 'Ocurrió un error al guardar tu inscripción. Por favor intenta de nuevo.';
      } else if (!data) {
        errorMensaje = 'No se recibieron datos de la inscripción. Por favor intenta de nuevo.';
      } else {
        datosTicket = data;

        // Usamos estrictamente el qr_uuid que ya generó y devolvió la función enviarInscripcion
        const qrText = String(datosTicket.qr_uuid);
        
        qrDataUrl = await QRCode.toDataURL(qrText, {
          width: 400,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });

        form = crearEstadoFormularioVacio();
        mostrarOverlay = true;
      }
    } catch (err) {
      console.error('Error inesperado en el handleSubmit:', err);
      errorMensaje = 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
    } finally {
      cargando = false;
    }
  }

  async function descargarTicket() {
    if (!ticketElementRef || !datosTicket) return;
    procesandoAccion = true;

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(ticketElementRef, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: '#07090e',
        height: ticketElementRef.scrollHeight,
        style: {
          transform: 'none',
          maxHeight: 'none'
        }
      });
      
      const link = document.createElement('a');
      link.download = `Ticket-Congreso-2026-${datosTicket.nombre_completo.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al descargar:', err);
      alert('No se pudo generar la imagen automáticamente. Puedes tomar una captura de pantalla.');
    } finally {
      procesandoAccion = false;
    }
  }

  async function compartirTicket() {
    if (!ticketElementRef || !datosTicket) return;
    procesandoAccion = true;

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(ticketElementRef, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: '#07090e',
        height: ticketElementRef.scrollHeight,
        style: {
          transform: 'none',
          maxHeight: 'none'
        }
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const archivo = new File([blob], `Ticket-Congreso-2026-${datosTicket.nombre_completo.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
        await navigator.share({
          title: 'Mi Ticket - Congreso 2026',
          text: `¡Hola ${datosTicket.nombre_completo}! Este es tu ticket de acceso para el Congreso 2026.`,
          files: [archivo],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Mi Ticket - Congreso 2026',
          text: `¡Hola ${datosTicket.nombre_completo}! Este es mi ticket de acceso para el Congreso 2026.`,
          url: window.location.href,
        });
      } else {
        alert('Tu navegador no soporta compartir archivos directamente. Usa el botón de descargar.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Error al compartir:', err);
    } finally {
      procesandoAccion = false;
    }
  }

  function cerrarOverlay() {
    mostrarOverlay = false;
    datosTicket = null;
    qrDataUrl = '';
  }
</script>

<section id="inscripcion" class="bg-white text-slate-600 pt-10 md:pt-14 pb-5 border-t border-slate-100 relative overflow-hidden">
  <div class="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-emerald-100/40 blur-[120px] rounded-full pointer-events-none"></div>

  <div class="max-w-3xl mx-auto px-6 relative z-10">
    <div class="text-center mb-6">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
        Formulario de Inscripción Congreso
      </h2>
    </div>

    <div class="space-y-5">
      <p class="text-md md:text-base text-slate-600 font-medium text-center px-2">
        Por favor diligencia los siguientes datos:
      </p>

      <div class="bg-slate-50/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-6 md:p-10 shadow-sm transition-shadow duration-300">
        <form
          on:submit={handleSubmit}
          autocomplete="off"
          data-form-type="other"
          class="space-y-6"
        >
          {#if errorMensaje}
            <div class="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium">
              {errorMensaje}
            </div>
          {/if}

          <div>
            <label for="nombre" class="block text-md sm:text-[15px] font-semibold text-slate-800 mb-2">*Nombre Completo:</label>
            <input 
              type="text" 
              id="nombre" 
              bind:value={form.nombre_completo}
              required 
              autocomplete="off"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="telefono" class="block text-md sm:text-[15px] font-semibold text-slate-800 mb-2">*Teléfono/WhatsApp:</label>
              <input 
                type="tel" 
                id="telefono" 
                bind:value={form.telefono}
                required 
                autocomplete="off"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label for="ciudad" class="block text-md sm:text-[15px] font-semibold text-slate-800 mb-2">*Ciudad:</label>
              <input 
                type="text" 
                id="ciudad" 
                bind:value={form.ciudad}
                required 
                autocomplete="off"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label for="congregacion" class="block text-md sm:text-[15px] font-semibold text-slate-800 mb-2">*Nombre de la congregación donde asiste:</label>
            <div class="relative">
              <select 
                id="congregacion" 
                bind:value={form.congregacion}
                required
                autocomplete="off"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm appearance-none cursor-pointer"
              >
                {#each CONGREGACION_OPCIONES as opcion (opcion.valor)}
                  <option value={opcion.valor} disabled={opcion.disabled || false}>{opcion.etiqueta}</option>
                {/each}
              </select>
            </div>

            {#if form.congregacion === 'Otra'}
              <div class="mt-3">
                <input 
                  type="text" 
                  bind:value={form.otra_congregacion}
                  required
                  autocomplete="off"
                  placeholder="Digita el nombre de tu congregación" 
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
                />
              </div>
            {/if}
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              disabled={cargando}
              class="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold text-center text-md sm:text-[15px] tracking-normal shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {cargando ? 'Guardando registro...' : 'Completar Inscripción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  {#if mostrarOverlay && datosTicket}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        <div class="flex flex-col items-center justify-center space-y-1">
          <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-900 tracking-tight">¡Inscripción Exitosa!</h3>
          <p class="text-xs text-slate-500 font-medium">Guarda, comparte o toma captura de tu ticket</p>
        </div>

        <div class="rounded-3xl overflow-hidden shadow-xl border border-white/10">
          <div bind:this={ticketElementRef} class="bg-[#07090e] text-white text-left p-2.5">
            <div class="border-t-2 border-x-2 border-dashed border-white/25 rounded-t-2xl pt-4 px-4 pb-4">
              
              <div class="text-center mb-2">
                <span class="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Centro Mundial de Evangelismo</span>
              </div>

              <div class="text-center mb-3">
                <div class="text-xl font-black tracking-tighter uppercase leading-none text-white">CONGRESO</div>
                <div class="text-2xl font-black tracking-tighter leading-none mt-1 text-white">2026</div>
                <div class="text-[11px] text-[#fef08a] font-bold mt-1.5">El Siglo del Espíritu Santo</div>
                <div class="text-[11px] font-extrabold text-emerald-300 tracking-wider mt-1 uppercase">13, 14 y 15 de Noviembre</div>
              </div>

              <div class="flex justify-center mb-3">
                <div class="bg-white p-2.5 rounded-2xl shadow-md">
                  {#if qrDataUrl}
                    <img src={qrDataUrl} alt="QR Code" class="w-28 h-28 block" />
                  {/if}
                </div>
              </div>

              <div class="text-center">
                <div class="text-lg font-black text-white truncate">{datosTicket.nombre_completo}</div>
              </div>

            </div>

            <div class="mx-[-10px] mb-[-10px] bg-gradient-to-r from-[#059669] via-[#10b981] to-[#06b6d4] p-3 text-center">
              <span class="text-[11px] font-black text-[#020617] tracking-widest uppercase">TICKET VIRTUAL</span>
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button 
            on:click={descargarTicket}
            disabled={procesandoAccion}
            class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {procesandoAccion ? 'Generando...' : 'Descargar Ticket como Imagen'}
          </button>

          <button 
            on:click={compartirTicket}
            disabled={procesandoAccion}
            class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Compartir Ticket
          </button>

          <button 
            on:click={cerrarOverlay}
            class="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  {/if}
</section>