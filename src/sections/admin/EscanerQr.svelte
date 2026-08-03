<script>
  import { onMount, onDestroy } from 'svelte';
  import { Html5Qrcode } from 'html5-qrcode';
  import { supabase } from '../../lib/supabase.js'; // Ajusta la ruta a tu cliente de supabase

  let html5QrCode = null;
  let escaneando = false;
  let mensajeResultado = '';
  let esExito = false;
  let asistenteDetectado = null;

  onMount(() => {
    // La instancia se inicializa cuando se monta el componente o se abre la sección
  });

  async function iniciarEscanner() {
    mensajeResultado = '';
    asistenteDetectado = null;
    escaneando = true;

    try {
      html5QrCode = new Html5Qrcode("lector-qr");
      
      await html5QrCode.start(
        { facingMode: "environment" }, // Usa la cámara trasera en celulares
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          // decodedText contiene el qr_uuid que leyo del carné/ticket
          await procesarAsistencia(decodedText);
        },
        (errorMessage) => {
          // Errores de escaneo en tiempo real (se pueden ignorar ya que busca constantemente)
        }
      );
    } catch (err) {
      console.error("Error al iniciar la cámara:", err);
      mensajeResultado = "No se pudo acceder a la cámara. Revisa los permisos.";
      esExito = false;
      escaneando = false;
    }
  }

  async function detenerEscanner() {
    if (html5QrCode && html5QrCode.isScanning) {
      await html5QrCode.stop();
      await html5QrCode.clear();
    }
    escaneando = false;
  }

  async function procesarAsistencia(qrUuid) {
    // Detenemos temporalmente el escáner para procesar el código detectado
    await detenerEscanner();

    mensajeResultado = "Verificando código...";
    
    // 1. Buscamos el registro en Supabase usando el qr_uuid
    const { data: inscrito, error: errorBusqueda } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('qr_uuid', qrUuid)
      .single();

    if (errorBusqueda || !inscrito) {
      mensajeResultado = "❌ Ticket no válido o no encontrado en el sistema.";
      esExito = false;
      return;
    }

    // 2. Verificamos si ya había ingresado antes
    if (inscrito.estado_asistencia === 'asistió') {
      mensajeResultado = `⚠️ ¡Atención! ${inscrito.nombre_completo} ya había ingresado previamente.`;
      esExito = false;
      asistenteDetectado = inscrito;
      return;
    }

    // 3. Actualizamos el estado de asistencia a 'asistió'
    const { error: errorUpdate } = await supabase
      .from('inscripciones')
      .update({ estado_asistencia: 'asistió' })
      .eq('qr_uuid', qrUuid);

    if (errorUpdate) {
      mensajeResultado = "❌ Error al actualizar la asistencia en la base de datos.";
      esExito = false;
    } else {
      mensajeResultado = `✅ ¡Asistencia confirmada con éxito!`;
      esExito = true;
      asistenteDetectado = inscrito;
    }
  }

  onDestroy(async () => {
    await detenerEscanner();
  });
</script>

<div class="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-md border border-slate-100 text-center space-y-4">
  <h3 class="text-xl font-extrabold text-slate-900">Escáner de Asistencia</h3>
  <p class="text-sm text-slate-500">Usa la cámara del móvil para escanear el QR del ticket del asistente.</p>

  <!-- Contenedor donde se renderiza la cámara -->
  <div id="lector-qr" class="w-full overflow-hidden rounded-xl bg-slate-900 min-h-[250px]"></div>

  <!-- Botones de Control de la Cámara -->
  <div class="space-y-2">
    {#if !escaneando}
      <button 
        on:click={iniciarEscanner}
        class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md"
      >
        📷 Activar Cámara para Escanear
      </button>
    {:else}
      <button 
        on:click={detenerEscanner}
        class="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md"
      >
        ⏹️ Detener Cámara
      </button>
    {/if}
  </div>

  <!-- Resultado del Escaneo -->
  {#if mensajeResultado}
    <div class={`p-4 rounded-xl text-sm font-semibold ${esExito ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
      <p>{mensajeResultado}</p>
      {#if asistenteDetectado}
        <div class="mt-2 text-left text-xs bg-white/80 p-3 rounded-lg border border-slate-200 space-y-1 text-slate-700">
          <p><strong>Nombre:</strong> {asistenteDetectado.nombre_completo}</p>
          <p><strong>Ciudad:</strong> {asistenteDetectado.ciudad}</p>
          <p><strong>Congregación:</strong> {asistenteDetectado.congregacion}</p>
        </div>
      {/if}
    </div>
  {/if}
</div>