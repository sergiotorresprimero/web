/**
 * Configuración centralizada y lógica compartida del formulario de inscripción
 * al Congreso. Tanto el formulario público como el de administración usan
 * este módulo para mantener consistencia.
 *
 * Si necesitas agregar/quitar campos, cambiar opciones del select de congregación,
 * o modificar validaciones, SOLO hazlo aquí.
 */
import { supabase } from '../lib/supabase.js';
import { capitalizarTexto } from '../lib/utils.js';

// ============================================================
// OPCIONES DEL SELECT DE CONGREGACIÓN (FUENTE DE VERDAD)
// ============================================================
export const CONGREGACION_OPCIONES = [
  { valor: '', etiqueta: 'Selecciona una opción', disabled: true },
  { valor: 'Centro Mundial de Evangelismo | Cali', etiqueta: 'Centro Mundial de Evangelismo | Cali' },
  { valor: 'Centro Mundial de Evangelismo | La Union Nariño', etiqueta: 'Centro Mundial de Evangelismo | La Unión Nariño' },
  { valor: 'Otra', etiqueta: 'Otra' },
  { valor: 'No asisto a ninguna iglesia', etiqueta: 'No asisto a ninguna iglesia' },
];

// ============================================================
// DEFINICIÓN DE CAMPOS DEL FORMULARIO
// ============================================================
export const CAMPOS_FORMULARIO = [
  {
    nombre: 'nombre_completo',
    label: 'Nombre Completo',
    labelPublico: '*Nombre Completo:',
    labelAdmin: 'Nombre Completo *',
    tipo: 'text',
    requerido: true,
    placeholder: '',
    grid: 'full',
  },
  {
    nombre: 'telefono',
    label: 'Teléfono/WhatsApp',
    labelPublico: '*Teléfono/WhatsApp:',
    labelAdmin: 'Teléfono *',
    tipo: 'tel',
    requerido: true,
    placeholder: '',
    grid: 'half',
  },
  {
    nombre: 'ciudad',
    label: 'Ciudad',
    labelPublico: '*Ciudad:',
    labelAdmin: 'Ciudad *',
    tipo: 'text',
    requerido: true,
    placeholder: '',
    grid: 'half',
  },
  {
    nombre: 'congregacion',
    label: 'Nombre de la congregación donde asiste',
    labelPublico: '*Nombre de la congregación donde asiste:',
    labelAdmin: 'Congregación *',
    tipo: 'select',
    requerido: true,
    placeholder: '',
    grid: 'full',
    tieneOtra: true,
  },
];

/**
 * Normaliza y transforma los datos crudos del formulario antes de enviarlos.
 * Aplica trim, capitalización, manejo del campo "Otra" congregación, etc.
 *
 * @param {Object} datos - Datos crudos del formulario
 * @param {string} datos.nombre_completo
 * @param {string} datos.telefono
 * @param {string} datos.ciudad
 * @param {string} datos.congregacion
 * @param {string} [datos.otra_congregacion] - Valor del campo "Otra" si aplica
 * @returns {Object} Datos normalizados listos para la base de datos
 */
export function normalizarDatosFormulario(datos) {
  let congregacionFinal = datos.congregacion;
  if (congregacionFinal === 'Otra') {
    congregacionFinal = (datos.otra_congregacion || '').trim();
  }

  return {
    nombre_completo: capitalizarTexto((datos.nombre_completo || '').trim()),
    telefono: (datos.telefono || '').trim(),
    ciudad: capitalizarTexto((datos.ciudad || '').trim()),
    congregacion: datos.congregacion === 'Otra'
      ? capitalizarTexto(congregacionFinal)
      : congregacionFinal,
  };
}

/**
 * Valida los datos del formulario antes del envío.
 *
 * @param {Object} datosNormalizados - Datos ya pasados por normalizarDatosFormulario()
 * @param {Object} datosOriginales - Datos crudos para verificar si "otra_congregacion" fue llenada
 * @returns {string|null} Mensaje de error o null si todo está OK
 */
export function validarFormulario(datosNormalizados, datosOriginales) {
  if (!datosNormalizados.nombre_completo) {
    return 'El nombre completo es obligatorio';
  }
  if (!datosNormalizados.telefono) {
    return 'El teléfono es obligatorio';
  }
  if (!datosNormalizados.ciudad) {
    return 'La ciudad es obligatoria';
  }
  if (!datosOriginales.congregacion) {
    return 'Por favor selecciona una congregación';
  }
  if (datosOriginales.congregacion === 'Otra' && !(datosOriginales.otra_congregacion || '').trim()) {
    return 'Por favor especifica el nombre de la congregación';
  }
  return null;
}

/**
 * Envía la inscripción a la tabla de Supabase.
 *
 * @param {Object} datosCrudos - Datos crudos del formulario
 * @param {Object} [opciones] - Configuración adicional
 * @param {'pendiente'|'asistió'} [opciones.estadoAsistencia='pendiente'] - Estado inicial
 * @param {Object} [opciones.camposExtra={}] - Campos adicionales a incluir en el insert
 * @returns {Promise<{data: any, error: any}>} Resultado de la inserción
 */
export async function enviarInscripcion(datosCrudos, opciones = {}) {
  const {
    estadoAsistencia = 'pendiente',
    camposExtra = {},
  } = opciones;

  const datosNormalizados = normalizarDatosFormulario(datosCrudos);
  const errorValidacion = validarFormulario(datosNormalizados, datosCrudos);
  if (errorValidacion) {
    return { data: null, error: { message: errorValidacion } };
  }

  const datosEnvio = {
    ...datosNormalizados,
    estado_asistencia: estadoAsistencia,
    ocupacion: 'Ninguna',
    cantidad_ninos: 0,
    nombres_ninos: null,
    ...camposExtra,
  };

  const { data, error } = await supabase
    .from('inscripciones')
    .insert([datosEnvio])
  
  return { data, error };
}

/**
 * Valores iniciales vacíos para crear un nuevo objeto de estado de formulario.
 */
export function crearEstadoFormularioVacio() {
  return {
    nombre_completo: '',
    telefono: '',
    ciudad: '',
    congregacion: '',
    otra_congregacion: '',
  };
}
