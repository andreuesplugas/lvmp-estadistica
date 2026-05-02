// Google Analytics - Events personalizados
// https://developers.google.com/analytics/devguides/collection/ga4/events

/**
 * Enviar evento cuando se carga la tabla
 */
function trackTableLoaded() {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'tabla_cargada', {
    'event_category': 'datos',
    'event_label': 'CSV cargado exitosamente'
  });
}

/**
 * Enviar evento cuando se filtra la tabla
 */
function trackTableFilter(filterValue) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'tabla_filtrada', {
    'event_category': 'interaccion',
    'event_label': 'Filtro aplicado',
    'search_term': filterValue
  });
}

/**
 * Enviar evento cuando se ordena la tabla
 */
function trackTableSort(columnName) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'tabla_ordenada', {
    'event_category': 'interaccion',
    'event_label': 'Columna ordenada',
    'sort_column': columnName
  });
}

/**
 * Enviar evento cuando se pagina
 */
function trackPagination(pageNumber) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'tabla_paginacion', {
    'event_category': 'interaccion',
    'event_label': 'Página visitada',
    'page_number': pageNumber
  });
}

/**
 * Enviar evento cuando se hace click en un enlace
 */
function trackLinkClick(url) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'enlace_clickeado', {
    'event_category': 'enlace',
    'event_label': url
  });
}

/**
 * Enviar evento de error
 */
function trackError(errorMessage) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'exception', {
    'description': errorMessage,
    'fatal': false
  });
}
