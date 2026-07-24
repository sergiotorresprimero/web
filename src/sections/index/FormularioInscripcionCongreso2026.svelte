<script>
  import { supabase } from '../../lib/supabase.js';

  // Variables de estado del formulario
  let nombre = '';
  let telefono = '';
  let ciudad = '';
  
  let congregacion = '';
  let otraCongregacion = '';
  
  let tieneOcupacion = 'No';
  let detalleOcupacion = '';
  
  let vieneConNinos = 'No';
  let cantidadNinos = 1;
  let nombresNinos = '';

  // Estados de la interfaz
  let cargando = false;
  let mensajeExito = false;
  let errorMensaje = '';

  async function handleSubmit(event) {
    event.preventDefault();
    cargando = true;
    errorMensaje = '';
    
    const datosEnvio = {
      nombre_completo: nombre.trim(),
      telefono: telefono.trim(),
      ciudad: ciudad.trim(),
      congregacion: congregacion === 'Otra' ? otraCongregacion.trim() : congregacion,
      ocupacion: tieneOcupacion === 'Si' ? detalleOcupacion.trim() : 'Ninguna',
      cantidad_ninos: vieneConNinos === 'Si' ? Number(cantidadNinos) : 0,
      nombres_ninos: vieneConNinos === 'Si' ? nombresNinos.trim() : null
    };

    try {
      const { data, error } = await supabase
        .from('inscripciones')
        .insert([datosEnvio]);

      if (error) throw error;

      mensajeExito = true;
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
    tieneOcupacion = 'No';
    detalleOcupacion = '';
    vieneConNinos = 'No';
    cantidadNinos = 1;
    nombresNinos = '';
  }
</script>

<section id="inscripcion" class="bg-white text-slate-600 py-12 md:py-16 border-t border-slate-100 relative overflow-hidden">
  <!-- Luces de fondo sutiles -->
  <div class="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-emerald-100/40 blur-[120px] rounded-full pointer-events-none"></div>

  <div class="max-w-3xl mx-auto px-6 relative z-10">
    
    <!-- Encabezado Moderno & Profesional -->
    <div class="text-center mb-8 md:mb-10">
      
      <!-- Insignia Badge refinada -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/60 mb-4 shadow-2xs">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        CONGRESO 2026
      </div>

      <!-- Título Principal con degradado sutil en slate -->
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
        Formulario de Inscripción
      </h2>

      <!-- Párrafo Guía Mínimo y Limpio -->
      <p class="text-xs md:text-sm text-slate-500 max-w-sm mx-auto font-medium mt-2">
        Completa tus datos a continuación para confirmar tu asistencia.
      </p>

    </div>

    <!-- Formulario -->
    <div class="bg-slate-50/80 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-6 md:p-10 shadow-sm transition-shadow duration-300">
      
      {#if mensajeExito}
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-xl text-center space-y-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
          </svg>
          <h3 class="text-xl font-bold text-slate-900">¡Inscripción Exitosa!</h3>
          <p class="text-sm text-slate-600">Tus datos han sido registrados correctamente para el Congreso 2026. ¡Te esperamos!</p>
          <button 
            on:click={() => mensajeExito = false}
            class="mt-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
          >
            Inscribir a otra persona
          </button>
        </div>
      {:else}
        <form on:submit={handleSubmit} class="space-y-6">
          
          {#if errorMensaje}
            <div class="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium">
              {errorMensaje}
            </div>
          {/if}

          <!-- Nombre Completo -->
          <div>
            <label for="nombre" class="block text-sm font-semibold text-slate-800 mb-2">Nombre Completo *</label>
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
              <label for="telefono" class="block text-sm font-semibold text-slate-800 mb-2">Teléfono / WhatsApp *</label>
              <input 
                type="tel" 
                id="telefono" 
                bind:value={telefono}
                required 
                class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label for="ciudad" class="block text-sm font-semibold text-slate-800 mb-2">Ciudad *</label>
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
            <label for="congregacion" class="block text-sm font-semibold text-slate-800 mb-2">Nombre de la congregación donde asiste *</label>
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

          <!-- Pregunta 2: Ocupación en la iglesia -->
          <div>
            <span class="block text-sm font-semibold text-slate-800 mb-2">¿Tiene alguna ocupación en la iglesia donde asiste? *</span>
            <div class="flex items-center gap-6 pt-1">
              <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="radio" bind:group={tieneOcupacion} value="Si" class="h-4 w-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                <span>Sí</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="radio" bind:group={tieneOcupacion} value="No" class="h-4 w-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                <span>No</span>
              </label>
            </div>

            {#if tieneOcupacion === 'Si'}
              <div class="mt-3">
                <input 
                  type="text" 
                  bind:value={detalleOcupacion}
                  required
                  placeholder="Digita tu ocupación o cargo" 
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm"
                />
              </div>
            {/if}
          </div>

          <!-- Pregunta 3: Niños menores de 10 años -->
          <div>
            <span class="block text-sm font-semibold text-slate-800 mb-2">¿Viene con algún niño menor de 10 años? *</span>
            <div class="flex items-center gap-6 pt-1">
              <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="radio" bind:group={vieneConNinos} value="Si" class="h-4 w-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                <span>Sí</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="radio" bind:group={vieneConNinos} value="No" class="h-4 w-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                <span>No</span>
              </label>
            </div>

            {#if vieneConNinos === 'Si'}
              <div class="mt-3 space-y-3">
                <div>
                  <label for="cant_ninos" class="block text-xs font-semibold text-slate-700 mb-1">
                    ¿Cuántos niños menores de 10 años lo acompañan?
                  </label>
                  <select 
                    id="cant_ninos"
                    bind:value={cantidadNinos}
                    class="w-full md:w-40 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={1}>1 niño</option>
                    <option value={2}>2 niños</option>
                    <option value={3}>3 niños</option>
                    <option value={4}>4 o más niños</option>
                  </select>
                </div>

                <div>
                  <textarea 
                    bind:value={nombresNinos}
                    required
                    rows="2"
                    placeholder="Digita los nombres completos y edades de los niños" 
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200 text-sm resize-none"
                  ></textarea>
                </div>
              </div>
            {/if}
          </div>

          <!-- Botón de Envío Verde -->
          <div class="pt-4">
            <button 
              type="submit" 
              disabled={cargando}
              class="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-center text-sm tracking-wide shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {cargando ? 'Guardando registro...' : 'Confirmar Mi Inscripción al Congreso'}
            </button>
          </div>

        </form>
      {/if}

    </div>

  </div>
</section>