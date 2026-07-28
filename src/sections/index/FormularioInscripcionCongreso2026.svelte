<script>
  import { supabase } from '../../lib/supabase.js';
  import { capitalizarTexto } from '../../lib/utils.js';

  // Variables de estado del formulario
  let nombre = '';
  let telefono = '';
  let ciudad = '';
  
  let congregacion = '';
  let otraCongregacion = '';

  // Estados de la interfaz
  let cargando = false;
  let mostrarOverlay = false;
  let errorMensaje = '';

  async function handleSubmit(event) {
    event.preventDefault();
    cargando = true;
    errorMensaje = '';
    
    const congregacionSeleccionada = congregacion === 'Otra' ? otraCongregacion.trim() : congregacion;

    const datosEnvio = {
      nombre_completo: capitalizarTexto(nombre),
      telefono: telefono.trim(),
      ciudad: capitalizarTexto(ciudad),
      congregacion: congregacion === 'Otra' ? capitalizarTexto(congregacionSeleccionada) : congregacionSeleccionada,
      ocupacion: 'Ninguna',
      cantidad_ninos: 0,
      nombres_ninos: null
    };

    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .insert([datosEnvio]);

      if (error) throw error;

      // Se elimina el window.scrollTo para mantener la posición actual del usuario
      mostrarOverlay = true;
      limpiarCampos();
    } catch (err) {
      console.error('Error al insertar:', err);
      errorMensaje = 'Ocurrió un error al guardar tu inscripción. Por favor intenta de nuevo.';
    } finally {
      cargando = false;
    }
  }

  function limpiarCampos() {
    nombre = '';
    telefono = '';
    ciudad = '';
    congregacion = '';
    otraCongregacion = '';
  }

  function cerrarOverlay() {
    mostrarOverlay = false;
  }
</script>

<section id="inscripcion" class="bg-white text-slate-600 py-10 md:py-14 border-t border-slate-100 relative overflow-hidden">
  <!-- Luces de fondo sutiles -->
  <div class="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-emerald-100/40 blur-[120px] rounded-full pointer-events-none"></div>

  <div class="max-w-3xl mx-auto px-6 relative z-10">
    
    <!-- Encabezado Moderno & Profesional -->
    <div class="text-center mb-6">
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
        Formulario de Inscripción Congreso
      </h2>
    </div>

    <!-- Formulario con su texto guía centrado y pegado arriba de la card -->
    <div class="space-y-5">
      <!-- Texto guía con tamaño aumentado (text-sm md:text-base) -->
      <p class="text-md md:text-base text-slate-600 font-medium text-center px-2">
        Por favor diligencia los siguientes datos:
      </p>

      <div class="bg-slate-50/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-6 md:p-10 shadow-sm transition-shadow duration-300">
        
        <form on:submit={handleSubmit} class="space-y-6">
          
          {#if errorMensaje}
            <div class="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium">
              {errorMensaje}
            </div>
          {/if}

          <!-- Nombre Completo -->
          <div>
            <label for="nombre" class="block text-md sm:text-[15px] font-semibold text-slate-800 mb-2">Nombre Completo: *</label>
            <input 
              type="text" 
              id="nombre" 
              bind:value={nombre}
              required 
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
            />
          </div>

          <!-- Teléfono y Ciudad -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="telefono" class="block text-md sm:text-[15px] font-semibold text-slate-800 mb-2">Teléfono / WhatsApp: *</label>
              <input 
                type="tel" 
                id="telefono" 
                bind:value={telefono}
                required 
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label for="ciudad" class="block text-md sm:text-[15px] font-semibold text-slate-800 mb-2">Ciudad: *</label>
              <input 
                type="text" 
                id="ciudad" 
                bind:value={ciudad}
                required 
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <!-- Pregunta 1: Congregación -->
          <div>
            <label for="congregacion" class="block text-md sm:text-[15px] font-semibold text-slate-800 mb-2">Nombre de la congregación donde asiste: *</label>
            <div class="relative">
              <select 
                id="congregacion" 
                bind:value={congregacion}
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm appearance-none cursor-pointer"
              >
                <option value="" disabled selected>Selecciona una opción</option>
                <option value="Centro Mundial de Evangelismo">Centro Mundial de Evangelismo</option>
                <option value="Otra">Otra</option>
                <option value="No asisto a ninguna iglesia">No asisto a ninguna iglesia</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            {#if congregacion === 'Otra'}
              <div class="mt-3">
                <input 
                  type="text" 
                  bind:value={otraCongregacion}
                  required
                  placeholder="Digita el nombre de tu congregación" 
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
                />
              </div>
            {/if}
          </div>

          <!-- Botón de Envío Verde -->
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

  <!-- OVERLAY DE CONFIRMACIÓN -->
  {#if mostrarOverlay}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Icono de éxito -->
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div class="space-y-1">
          <h3 class="text-xl font-extrabold text-slate-900">¡Inscripción Exitosa!</h3>
          <p class="text-sm text-slate-500">Tus datos han sido registrados correctamente para el Congreso 2026. ¡Te esperamos!</p>
        </div>

        <!-- Botón único de cierre -->
        <div class="pt-2">
          <button 
            on:click={cerrarOverlay}
            class="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  {/if}

</section>