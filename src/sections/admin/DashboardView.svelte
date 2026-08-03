<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  import { capitalizarTexto } from '../../lib/utils.js';
  import {
    CONGREGACION_OPCIONES,
    enviarInscripcion,
    crearEstadoFormularioVacio,
  } from '../../config/formularioCongreso.js';
  
  // Importación del componente de escáner QR
  import EscanerQr from './EscanerQr.svelte';

  let userEmail = '';
  let inscripciones = [];
  let searchTerm = '';
  let loading = true;
  let errorMessage = '';
  
  let updatingId = null;

  // Estados para las notificaciones Toast
  let toastMessage = '';
  let toastType = 'success';
  let toastTimer;

  // Estados para el Panel Lateral (Drawer) de Detalles
  let selectedItem = null;

  // Estados para Modal: Registro Rápido (Nuevo Asistente In-situ)
  let showAddModal = false;
  let newAttendee = crearEstadoFormularioVacio();
  let savingNew = false;

  // Estado para mostrar u ocultar el componente del Escáner QR
  let showScannerModal = false;

  // Estados para los Modales Overlay existentes (Editar, Desconfirmar, Eliminar)
  let showEditModal = false;
  let editingItem = { id: '', nombre_completo: '', telefono: '', congregacion: '', ciudad: '' };
  let savingEdit = false;

  let showUnconfirmModal = false;
  let unconfirmingItem = null;

  let showDeleteModal = false;
  let deletingItem = null;
  let deleting = false;

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = '/admin';
      return;
    }

    userEmail = session.user.email;
    await fetchInscripciones();
  });

  async function fetchInscripciones() {
    loading = true;
    const { data, error } = await supabase
      .from('inscripciones')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (error) {
      errorMessage = 'Error al cargar los datos de los asistentes.';
      console.error(error);
    } else {
      inscripciones = data || [];
    }
    loading = false;
  }

  function showToast(message, type = 'success') {
    clearTimeout(toastTimer);
    toastMessage = message;
    toastType = type;
    toastTimer = setTimeout(() => {
      toastMessage = '';
    }, 3000);
  }

  // Manejador del clic en el botón de estado
  function handleCheckInClick(item) {
    if (item.estado_asistencia === 'asistió') {
      unconfirmingItem = item;
      showUnconfirmModal = true;
    } else {
      executeToggle(item, 'asistió');
    }
  }

  async function executeToggle(item, nuevoEstado) {
    updatingId = item.id;

    const { error } = await supabase
      .from('inscripciones')
      .update({ estado_asistencia: nuevoEstado })
      .eq('id', item.id);

    updatingId = null;

    if (error) {
      console.error(error);
      showToast('Error al actualizar la asistencia', 'error');
    } else {
      inscripciones = inscripciones.map(i => 
        i.id === item.id ? { ...i, estado_asistencia: nuevoEstado } : i
      );
      
      if (selectedItem && selectedItem.id === item.id) {
        selectedItem = { ...selectedItem, estado_asistencia: nuevoEstado };
      }

      const actionText = nuevoEstado === 'asistió' ? 'marcado como Asistió' : 'marcado como Pendiente';
      showToast(`${item.nombre_completo}: ${actionText}`);
    }
  }

  async function confirmUnconfirm() {
    if (!unconfirmingItem) return;
    const item = unconfirmingItem;
    showUnconfirmModal = false;
    unconfirmingItem = null;
    await executeToggle(item, 'pendiente');
  }

  // Funciones de Registro Rápido In-situ (usando lógica centralizada)
  async function quickRegister() {
    savingNew = true;

    const { data, error } = await enviarInscripcion(newAttendee, {
      estadoAsistencia: 'asistió',
    });

    savingNew = false;

    if (error) {
      console.error(error);
      showToast(error.message || `Error al registrar`, 'error');
      return;
    }

    inscripciones = [data, ...inscripciones];
    showAddModal = false;
    newAttendee = crearEstadoFormularioVacio();
    showToast(`¡${data.nombre_completo} registrado y confirmado con éxito!`);
  }

  // Funciones de Edición
  function openEditModal(item) {
    editingItem = { ...item };
    showEditModal = true;
  }

  async function saveEdit() {
    savingEdit = true;
    const { error } = await supabase
      .from('inscripciones')
      .update({
        nombre_completo: capitalizarTexto(editingItem.nombre_completo),
        telefono: editingItem.telefono ? editingItem.telefono.trim() : '',
        congregacion: capitalizarTexto(editingItem.congregacion),
        ciudad: capitalizarTexto(editingItem.ciudad)
      })
      .eq('id', editingItem.id);

    savingEdit = false;

    if (error) {
      console.error(error);
      showToast('Error al guardar los cambios', 'error');
    } else {
      inscripciones = inscripciones.map(i => 
        i.id === editingItem.id ? { ...editingItem } : i
      );

      if (selectedItem && selectedItem.id === editingItem.id) {
        selectedItem = { ...editingItem };
      }

      showEditModal = false;
      showToast('Registro actualizado correctamente');
    }
  }

  // Funciones de Eliminación
  function openDeleteModal(item) {
    deletingItem = item;
    showDeleteModal = true;
  }

  async function confirmDelete() {
    if (!deletingItem) return;
    deleting = true;

    const { error } = await supabase
      .from('inscripciones')
      .delete()
      .eq('id', deletingItem.id);

    deleting = false;

    if (error) {
      console.error(error);
      showToast('Error al eliminar el registro', 'error');
    } else {
      inscripciones = inscripciones.filter(i => i.id !== deletingItem.id);
      if (selectedItem && selectedItem.id === deletingItem.id) {
        selectedItem = null;
      }
      showToast('Registro eliminado con éxito');
      showDeleteModal = false;
      deletingItem = null;
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/admin';
  }

  function normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function formatFecha(fechaStr) {
    if (!fechaStr) return 'N/A';
    try {
      return new Date(fechaStr).toLocaleString('es-ES', { 
        dateStyle: 'long', 
        timeStyle: 'medium' 
      });
    } catch {
      return fechaStr;
    }
  }

  $: filteredInscripciones = inscripciones.filter(item => {
    const query = normalizeText(searchTerm);
    const nombre = normalizeText(item.nombre_completo);
    const telefono = normalizeText(item.telefono);
    const congregacion = normalizeText(item.congregacion);
    const ciudad = normalizeText(item.ciudad);

    return nombre.includes(query) || 
           telefono.includes(query) || 
           congregacion.includes(query) ||
           ciudad.includes(query);
  });
</script>

<div class="p-6 max-w-7xl mx-auto relative">
  <!-- Notificación Toast -->
  {#if toastMessage}
    <div class={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
      toastType === 'success' 
        ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' 
        : 'bg-red-950/90 border-red-500/40 text-red-300'
    }`}>
      <span class={`w-2 h-2 rounded-full ${toastType === 'success' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-pulse'}`}></span>
      {toastMessage}
    </div>
  {/if}

  <!-- MODAL / CONTENEDOR DEL ESCÁNER QR -->
  {#if showScannerModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
          <h2 class="text-lg font-bold text-slate-100">Escáner de QR</h2>
          <button 
            on:click={() => showScannerModal = false}
            class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        
        <!-- Componente EscanerQr -->
        <EscanerQr on:checked={() => { fetchInscripciones(); }} />

        <div class="mt-4 text-center">
          <button 
            on:click={() => showScannerModal = false}
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors w-full"
          >
            Cerrar Escáner
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- PANEL LATERAL (DRAWER) DE DETALLES -->
  {#if selectedItem}
    <div class="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" on:click={() => selectedItem = null}></div>
    <div class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300">
      <div>
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
          <h2 class="text-lg font-bold text-slate-100">Detalles del Asistente</h2>
          <button 
            on:click={() => selectedItem = null}
            class="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div class="space-y-5 text-sm">
          <div>
            <span class="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</span>
            <p class="text-slate-100 font-medium text-base">{selectedItem.nombre_completo || 'Sin nombre'}</p>
          </div>

          <div>
            <span class="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Teléfono</span>
            <p class="text-slate-300">{selectedItem.telefono || 'N/A'}</p>
          </div>

          <div>
            <span class="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ciudad</span>
            <p class="text-slate-300">{selectedItem.ciudad || 'N/A'}</p>
          </div>

          <div>
            <span class="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Congregación</span>
            <p class="text-slate-300">{selectedItem.congregacion || 'N/A'}</p>
          </div>

          <div>
            <span class="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Estado de Asistencia</span>
            <span class={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              selectedItem.estado_asistencia === 'asistió' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
            }`}>
              {selectedItem.estado_asistencia === 'asistió' ? 'Asistió' : 'Pendiente'}
            </span>
          </div>

          <div>
            <span class="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Fecha y Hora de Registro</span>
            <p class="text-slate-300">{formatFecha(selectedItem.fecha_registro)}</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 pt-4 border-t border-slate-800">
        <button 
          on:click={() => { const item = selectedItem; selectedItem = null; openEditModal(item); }}
          class="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors text-center"
        >
          Editar Registro
        </button>
        <button 
          on:click={() => { const item = selectedItem; selectedItem = null; openDeleteModal(item); }}
          class="px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  {/if}

  <!-- MODAL OVERLAY: NUEVO ASISTENTE IN-SITU -->
  {#if showAddModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
          <h2 class="text-lg font-bold text-slate-100">Nuevo Asistente (In-situ)</h2>
          <span class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">Se marcará como Asistió</span>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase">Nombre Completo *</label>
            <input type="text" bind:value={newAttendee.nombre_completo} class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 text-slate-200" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1 uppercase">Teléfono *</label>
              <input type="text" bind:value={newAttendee.telefono} class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 text-slate-200" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1 uppercase">Ciudad *</label>
              <input type="text" bind:value={newAttendee.ciudad} class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 text-slate-200" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase">Congregación *</label>
            <select bind:value={newAttendee.congregacion} class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 text-slate-200">
              {#each CONGREGACION_OPCIONES as opcion (opcion.valor)}
                <option value={opcion.valor} disabled={opcion.disabled || false}>{opcion.etiqueta}</option>
              {/each}
            </select>
          </div>

          {#if newAttendee.congregacion === 'Otra'}
            <div>
              <label class="block text-xs font-medium text-slate-400 mb-1 uppercase">Especificar Congregación *</label>
              <input type="text" bind:value={newAttendee.otra_congregacion} class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 text-slate-200" />
            </div>
          {/if}
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button 
            on:click={() => showAddModal = false} 
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            on:click={quickRegister} 
            disabled={savingNew}
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {savingNew ? 'Registrando...' : 'Registrar y Confirmar'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- MODAL OVERLAY: EDITAR ASISTENTE -->
  {#if showEditModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 class="text-lg font-bold mb-4 text-slate-100">Editar Asistente</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase">Nombre Completo</label>
            <input type="text" bind:value={editingItem.nombre_completo} class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 text-slate-200" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase">Teléfono</label>
            <input type="text" bind:value={editingItem.telefono} class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 text-slate-200" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase">Congregación</label>
            <input type="text" bind:value={editingItem.congregacion} class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 text-slate-200" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase">Ciudad</label>
            <input type="text" bind:value={editingItem.ciudad} class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 text-slate-200" />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button 
            on:click={() => showEditModal = false} 
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            on:click={saveEdit} 
            disabled={savingEdit}
            class="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- MODAL OVERLAY: DESCONFIRMAR ASISTENCIA -->
  {#if showUnconfirmModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center">
        <div class="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 text-xl">
          ⚠️
        </div>
        <h2 class="text-lg font-bold text-slate-100 mb-2">¿Quitar asistencia?</h2>
        <p class="text-sm text-slate-400 mb-6">
          Estás a punto de cambiar el estado de <span class="text-slate-200 font-semibold">{unconfirmingItem?.nombre_completo}</span> de vuelta a pendiente.
        </p>

        <div class="flex justify-center gap-3">
          <button 
            on:click={() => showUnconfirmModal = false} 
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors w-full"
          >
            Cancelar
          </button>
          <button 
            on:click={confirmUnconfirm} 
            class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors w-full"
          >
            Sí, desconfirmar
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- MODAL OVERLAY: ELIMINAR REGISTRO -->
  {#if showDeleteModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl text-center">
        <div class="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 text-xl">
          🗑️
        </div>
        <h2 class="text-lg font-bold text-slate-100 mb-2">Eliminar registro</h2>
        <p class="text-sm text-slate-400 mb-6">
          ¿Estás seguro de eliminar permanentemente a <span class="text-slate-200 font-semibold">{deletingItem?.nombre_completo}</span>? Esta acción no se puede deshacer.
        </p>

        <div class="flex justify-center gap-3">
          <button 
            on:click={() => showDeleteModal = false} 
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors w-full"
          >
            Cancelar
          </button>
          <button 
            on:click={confirmDelete} 
            disabled={deleting}
            class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors w-full disabled:opacity-50"
          >
            {deleting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <header class="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
    <div>
      <h1 class="text-2xl font-bold">Control Asistencia Congreso</h1>
    </div>
    <button 
      on:click={handleLogout}
      class="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
    >
      Cerrar Sesión
    </button>
  </header>

  <div class="mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
    <div class="flex items-center gap-3 w-full max-w-xl">
      <input 
        type="text" 
        bind:value={searchTerm}
        placeholder="Buscar por nombre, teléfono, ciudad o congregación..." 
        class="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-slate-600 w-full"
      />
      <button 
        on:click={() => showAddModal = true}
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-lg shadow-emerald-900/20"
      >
        <span>+</span> Nuevo Asistente
      </button>

      <!-- Botón para activar el Escáner QR -->
      <button 
        on:click={() => showScannerModal = true}
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-lg shadow-indigo-900/20"
      >
        <span>📷</span> Escanear QR
      </button>
    </div>

    <div class="text-xs text-slate-400 text-right sm:text-left">
      Asistentes: <span class="text-emerald-400 font-bold">{inscripciones.filter(i => i.estado_asistencia === 'asistió').length}</span> / {inscripciones.length}
    </div>
  </div>

  {#if errorMessage}
    <div class="p-4 mb-6 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
      {errorMessage}
    </div>
  {/if}

  {#if loading}
    <p class="text-slate-400 text-center py-10">Cargando asistentes...</p>
  {:else}
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
            <th class="p-4">Nombre Completo</th>
            <th class="p-4">Teléfono</th>
            <th class="p-4">Ciudad</th>
            <th class="p-4">Congregación</th>
            <th class="p-4 text-center">Estado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 text-sm">
          {#each filteredInscripciones as item (item.id)}
            <tr 
              on:click={() => selectedItem = item}
              class="hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <td class="p-4 font-medium">
                <span>{item.nombre_completo || 'Sin nombre'}</span>
              </td>
              <td class="p-4 text-slate-400">{item.telefono || 'N/A'}</td>
              <td class="p-4 text-slate-400">{item.ciudad || 'N/A'}</td>
              <td class="p-4 text-slate-400">{item.congregacion || 'N/A'}</td>
              <td class="p-4 text-center" on:click|stopPropagation>
                <button 
                  on:click={() => handleCheckInClick(item)}
                  disabled={updatingId === item.id}
                  class={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 mx-auto min-w-[150px] ${
                    updatingId === item.id
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-wait animate-pulse'
                      : item.estado_asistencia === 'asistió' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20'
                  }`}
                >
                  {#if updatingId === item.id}
                    <span>Guardando...</span>
                  {:else}
                    <span class={`w-1.5 h-1.5 rounded-full ${item.estado_asistencia === 'asistió' ? 'bg-emerald-400' : 'bg-sky-400'}`}></span>
                    {item.estado_asistencia === 'asistió' ? 'Asistió' : 'Confirmar asistencia'}
                  {/if}
                </button>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="p-6 text-center text-slate-500">No se encontraron asistentes.</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>