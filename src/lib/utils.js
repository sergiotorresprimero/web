export function capitalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .trim()
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase());
}