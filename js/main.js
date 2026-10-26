// =====================================================================
// main.js — Interactividad de la web de Senti2 Óptica
// ---------------------------------------------------------------------
// ÍNDICE
//  0. Preparación
//  1. Barra superior: mensajes que rotan
//  2. Cabecera que se compacta al bajar
//  3. Menú móvil (hamburguesa) y acordeones del mega-menú
//  4. Pestañas de Novedades
//  5. Carrusel infinito de marcas
//  6. Buscador
//  7. Aparición suave al hacer scroll
//  8. Indicador "Abierto ahora / Cerrado"
//  9. Banner de cookies (RGPD)
// 10. Newsletter
// 11. Año del pie de página
// =====================================================================


// ---------- 0. PREPARACIÓN ----------
// Marcamos que hay JavaScript. El CSS usa esta clase para las animaciones,
// así, si el JS fallara, el contenido seguiría viéndose.
document.documentElement.classList.add('js');

// ¿La persona ha pedido "menos movimiento" en su sistema?
const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Textos que escribe el JavaScript, en el idioma de la página (<html lang="…">).
// Las partes entre llaves {q} {n} {h} {d} se rellenan con el dato real.
const TEXTOS = {
  es: {
    abrirMenu: 'Abrir menú', cerrarMenu: 'Cerrar menú',
    resultados: 'Resultados para «{q}»: {n}',
    sinResultados: 'Ahora mismo no tenemos «{q}» entre las novedades de la web, pero sí en tienda. ¡Pregúntanos!',
    abierto: 'Abierto ahora · hasta las {h}', cerrado: 'Cerrado ahora · {p}',
    abreHoy: 'abre hoy a las {h}', abreManana: 'abre mañana a las {h}',
    abreDia: 'abre el {d} a las {h}', abreDiaFecha: 'abre el {d} {n} a las {h}',
    dias: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    newsletterEnviando: 'Enviando…',
    newsletterOk: '¡Gracias! Te hemos apuntado. Revisa tu correo: te llegará una confirmación.',
    newsletterError: 'No se ha podido enviar. Inténtalo de nuevo o escríbenos a senti2moraira@gmail.com.'
  },
  en: {
    abrirMenu: 'Open menu', cerrarMenu: 'Close menu',
    resultados: 'Results for “{q}”: {n}',
    sinResultados: '“{q}” is not among the new arrivals on the website right now, but we do have it in store. Just ask us!',
    abierto: 'Open now · until {h}', cerrado: 'Closed now · {p}',
    abreHoy: 'opens today at {h}', abreManana: 'opens tomorrow at {h}',
    abreDia: 'opens on {d} at {h}', abreDiaFecha: 'opens on {d} {n} at {h}',
    dias: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    newsletterEnviando: 'Sending…',
    newsletterOk: 'Thank you! You are on the list. Check your inbox for a confirmation email.',
    newsletterError: 'It could not be sent. Please try again or email us at senti2moraira@gmail.com.'
  },
  de: {
    abrirMenu: 'Menü öffnen', cerrarMenu: 'Menü schließen',
    resultados: 'Ergebnisse für „{q}“: {n}',
    sinResultados: '„{q}“ ist derzeit nicht unter den Neuheiten auf der Website, aber im Geschäft. Fragen Sie uns!',
    abierto: 'Jetzt geöffnet · bis {h} Uhr', cerrado: 'Jetzt geschlossen · {p}',
    abreHoy: 'öffnet heute um {h} Uhr', abreManana: 'öffnet morgen um {h} Uhr',
    abreDia: 'öffnet am {d} um {h} Uhr', abreDiaFecha: 'öffnet am {d}, dem {n}., um {h} Uhr',
    dias: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    newsletterEnviando: 'Wird gesendet…',
    newsletterOk: 'Vielen Dank! Sie sind angemeldet. Eine Bestätigung kommt per E-Mail.',
    newsletterError: 'Senden nicht möglich. Bitte erneut versuchen oder an senti2moraira@gmail.com schreiben.'
  },
  fr: {
    abrirMenu: 'Ouvrir le menu', cerrarMenu: 'Fermer le menu',
    resultados: 'Résultats pour « {q} » : {n}',
    sinResultados: '« {q} » ne figure pas parmi les nouveautés du site pour le moment, mais nous l’avons en boutique. Demandez-nous !',
    abierto: 'Ouvert · jusqu’à {h}', cerrado: 'Fermé · {p}',
    abreHoy: 'ouvre aujourd’hui à {h}', abreManana: 'ouvre demain à {h}',
    abreDia: 'ouvre {d} à {h}', abreDiaFecha: 'ouvre {d} {n} à {h}',
    dias: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    newsletterEnviando: 'Envoi en cours…',
    newsletterOk: 'Merci ! Vous êtes inscrit. Une confirmation vous attend dans votre boîte mail.',
    newsletterError: 'L’envoi a échoué. Réessayez ou écrivez-nous à senti2moraira@gmail.com.'
  },
  nl: {
    abrirMenu: 'Menu openen', cerrarMenu: 'Menu sluiten',
    resultados: 'Resultaten voor “{q}”: {n}',
    sinResultados: '“{q}” staat momenteel niet bij de nieuwe modellen op de website, maar wel in de winkel. Vraag het ons!',
    abierto: 'Nu open · tot {h} uur', cerrado: 'Nu gesloten · {p}',
    abreHoy: 'opent vandaag om {h} uur', abreManana: 'opent morgen om {h} uur',
    abreDia: 'opent {d} om {h} uur', abreDiaFecha: 'opent {d} {n} om {h} uur',
    dias: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
    newsletterEnviando: 'Verzenden…',
    newsletterOk: 'Bedankt! U staat op de lijst. Controleer uw e-mail voor een bevestiging.',
    newsletterError: 'Verzenden is mislukt. Probeer het opnieuw of mail ons op senti2moraira@gmail.com.'
  }
};
const IDIOMA = (document.documentElement.lang || 'es').slice(0, 2);
const T = TEXTOS[IDIOMA] || TEXTOS.es;
// t('abierto', { h: '19:00' }) → "Abierto ahora · hasta las 19:00"
function t(clave, datos) {
  return T[clave].replace(/\{(\w+)\}/g, function (todo, k) { return datos[k]; });
}


// ---------- 1. BARRA SUPERIOR: MENSAJES QUE ROTAN ----------
const listaMensajes = document.querySelector('.barra-superior__mensajes');

if (listaMensajes && !menosMovimiento) {
  const mensajes = listaMensajes.querySelectorAll('li');
  let actual = 0;
  listaMensajes.classList.add('rotando');
  mensajes[0].classList.add('activo');

  // Cada 4 segundos ocultamos el mensaje actual y mostramos el siguiente
  setInterval(function () {
    mensajes[actual].classList.remove('activo');
    actual = (actual + 1) % mensajes.length; // al llegar al final, vuelve al 0
    mensajes[actual].classList.add('activo');
  }, 4000);
}


// ---------- 1b. ESCAPARATE DE LA PORTADA (opcional) ----------
// Solo actúa si en la portada hay un bloque <div class="escaparate">
// con varias gafas; ahora la portada lleva la foto de la tienda,
// así que este código no hace nada. Se deja por si se recupera.
const escaparate = document.querySelector('.escaparate');

if (escaparate) {
  const items = escaparate.querySelectorAll('.escaparate__item');
  const puntos = escaparate.querySelector('.escaparate__puntos');
  let activo = 0;
  let temporizador;

  function mostrar(indice) {
    items[activo].classList.remove('activo');
    puntos.children[activo].setAttribute('aria-selected', 'false');
    activo = indice;
    items[activo].classList.add('activo');
    puntos.children[activo].setAttribute('aria-selected', 'true');
  }

  function programar() {
    clearInterval(temporizador);
    if (menosMovimiento) return;
    temporizador = setInterval(function () {
      mostrar((activo + 1) % items.length);
    }, 4500);
  }

  // Creamos un punto por cada gafa
  items.forEach(function (item, i) {
    const punto = document.createElement('button');
    punto.type = 'button';
    punto.setAttribute('role', 'tab');
    punto.setAttribute('aria-selected', i === 0);
    punto.setAttribute('aria-label', item.querySelector('.escaparate__marca').textContent + ' ' + item.querySelector('.escaparate__modelo').textContent);
    punto.addEventListener('click', function () {
      mostrar(i);
      programar(); // reinicia la cuenta para que no cambie justo después
    });
    puntos.appendChild(punto);
  });

  // Se para mientras el ratón está encima
  escaparate.addEventListener('mouseenter', function () { clearInterval(temporizador); });
  escaparate.addEventListener('mouseleave', programar);
  programar();
}


// ---------- 2. CABECERA QUE SE COMPACTA AL BAJAR ----------
const cabecera = document.getElementById('cabecera');

function revisarCabecera() {
  // Si hemos bajado más de 40 píxeles, la cabecera se hace más baja
  cabecera.classList.toggle('cabecera--compacta', window.scrollY > 40);
}
window.addEventListener('scroll', revisarCabecera, { passive: true });
revisarCabecera();


// ---------- 3. MENÚ MÓVIL Y ACORDEONES ----------
const botonMenu = document.getElementById('boton-menu');
const menu = document.getElementById('menu-principal');

function abrirCerrarMenu(abrir) {
  menu.classList.toggle('menu--abierto', abrir);
  botonMenu.setAttribute('aria-expanded', abrir);
  botonMenu.setAttribute('aria-label', abrir ? T.cerrarMenu : T.abrirMenu);
  // Mientras el menú está abierto, la página de detrás no se mueve
  document.body.style.overflow = abrir ? 'hidden' : '';
}

botonMenu.addEventListener('click', function () {
  const estaAbierto = botonMenu.getAttribute('aria-expanded') === 'true';
  abrirCerrarMenu(!estaAbierto);
});

// Al pulsar un enlace del menú, se cierra
menu.querySelectorAll('a').forEach(function (enlace) {
  enlace.addEventListener('click', function () {
    abrirCerrarMenu(false);
  });
});

// La tecla Escape también lo cierra
document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape' && menu.classList.contains('menu--abierto')) {
    abrirCerrarMenu(false);
    botonMenu.focus();
  }
});

// Acordeones: "Gafas de sol" y "Gafas graduadas" se despliegan en el móvil
menu.querySelectorAll('.menu__desplegar').forEach(function (boton) {
  boton.addEventListener('click', function () {
    const panel = document.getElementById(boton.getAttribute('aria-controls'));
    const abierto = boton.getAttribute('aria-expanded') === 'true';
    boton.setAttribute('aria-expanded', !abierto);
    panel.classList.toggle('mega--abierto', !abierto);
  });
});


// ---------- 4. PESTAÑAS DE NOVEDADES ----------
const pestanas = document.querySelectorAll('.pestanas [role="tab"]');

function activarPestana(pestana) {
  limpiarBusqueda(); // si había una búsqueda activa, volvemos a mostrar todas las gafas
  pestanas.forEach(function (p) {
    const activa = p === pestana;
    p.setAttribute('aria-selected', activa);
    p.tabIndex = activa ? 0 : -1;  // solo la activa se alcanza con el tabulador
    document.getElementById(p.getAttribute('aria-controls')).hidden = !activa;
  });
}

pestanas.forEach(function (pestana, posicion) {
  pestana.addEventListener('click', function () {
    activarPestana(pestana);
  });
  // Flechas izquierda/derecha para cambiar de pestaña con el teclado
  pestana.addEventListener('keydown', function (evento) {
    if (evento.key !== 'ArrowRight' && evento.key !== 'ArrowLeft') return;
    const paso = evento.key === 'ArrowRight' ? 1 : -1;
    const siguiente = pestanas[(posicion + paso + pestanas.length) % pestanas.length];
    activarPestana(siguiente);
    siguiente.focus();
  });
});


// ---------- 5. CARRUSEL INFINITO DE MARCAS ----------
// Truco: duplicamos la lista de logos. La pista se mueve hasta la mitad
// (CSS) y vuelve a empezar; como las dos mitades son iguales, no se nota.
const pista = document.querySelector('.marcas__pista');

if (pista && !menosMovimiento) {
  const copia = pista.querySelector('.marcas__lista').cloneNode(true);
  copia.setAttribute('aria-hidden', 'true');           // los lectores de pantalla no la leen dos veces
  copia.querySelectorAll('a').forEach(function (a) {
    a.tabIndex = -1;                                    // ni el tabulador pasa dos veces
  });
  pista.appendChild(copia);
  pista.classList.add('marcas__pista--animada');
}


// ---------- 6. BUSCADOR ----------
// Busca la marca o modelo entre las Novedades y muestra solo lo que coincide.
const buscador = document.querySelector('.buscador');

// Quitamos tildes y mayúsculas para que "chloe" encuentre "Chloé"
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Deshace una búsqueda: vuelve a mostrar todas las gafas y borra el aviso
function limpiarBusqueda() {
  document.querySelectorAll('.producto').forEach(function (producto) {
    producto.hidden = false;
  });
  const aviso = document.getElementById('aviso-busqueda');
  if (aviso) aviso.remove();
  if (buscador) buscador.querySelector('input').value = '';
}

function buscar(texto) {
  const busqueda = normalizar(texto);
  const productos = document.querySelectorAll('.producto');
  let encontrados = 0;

  productos.forEach(function (producto) {
    const coincide = !busqueda || normalizar(producto.textContent).includes(busqueda);
    producto.hidden = !coincide;
    if (coincide) encontrados++;
  });

  // Sin texto, volvemos a la pestaña que estaba activa
  if (!busqueda) {
    activarPestana(document.querySelector('.pestanas [aria-selected="true"]'));
    return;
  }

  // Con una búsqueda mostramos los dos paneles (solares y graduadas)
  document.querySelectorAll('.productos').forEach(function (panel) {
    panel.hidden = false;
  });

  // Mensaje con el resultado
  let aviso = document.getElementById('aviso-busqueda');
  if (!aviso) {
    aviso = document.createElement('p');
    aviso.id = 'aviso-busqueda';
    aviso.className = 'aviso-busqueda';
    aviso.setAttribute('role', 'status');
    document.querySelector('.pestanas').after(aviso);
  }
  aviso.textContent = encontrados
    ? t('resultados', { q: texto.trim(), n: encontrados })
    : t('sinResultados', { q: texto.trim() });

  document.getElementById('novedades').scrollIntoView();
}

if (buscador) {
  buscador.addEventListener('submit', function (evento) {
    evento.preventDefault();
    buscar(buscador.querySelector('input').value);
  });
}

// Las marcas del mega-menú buscan esa marca en las novedades
document.querySelectorAll('.mega__marca').forEach(function (enlace) {
  enlace.addEventListener('click', function (evento) {
    evento.preventDefault();
    if (buscador) buscador.querySelector('input').value = enlace.textContent;
    buscar(enlace.textContent);
  });
});


// ---------- 7. APARICIÓN SUAVE AL HACER SCROLL ----------
// Elegimos qué elementos aparecen poco a poco
const elementosAnimados = document.querySelectorAll(
  '.seccion__cabecera, .salud__intro > *, .edad, .senales, .problema, .habitos > *, .profesional, .producto, .tendencia, .servicio, .conoce__foto, .conoce__texto, .tienda__foto, .opinion, .cita__opciones li, .newsletter__caja'
);

if ('IntersectionObserver' in window && !menosMovimiento) {
  // El "observador" avisa cuando un elemento entra en pantalla
  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target); // solo una vez
      }
    });
  }, { rootMargin: '0px 0px -60px 0px' });

  elementosAnimados.forEach(function (elemento, i) {
    elemento.classList.add('aparecer');
    // Pequeño retraso escalonado entre elementos vecinos
    elemento.style.transitionDelay = (i % 5) * 80 + 'ms';
    observador.observe(elemento);
  });
}


// ---------- 8. INDICADOR "ABIERTO AHORA / CERRADO" ----------
// Horario: día de la semana (0 = domingo … 6 = sábado) → [abre, cierra]
// en minutos desde medianoche. 10:00 = 600, 19:00 = 1140, 14:00 = 840.
// Es el mismo horario que aparece en vuestra ficha de Google.
// Si un día tiene horario partido, añade otro tramo: [[600, 840], [1020, 1140]]
const HORARIO = {
  0: [],              // domingo: cerrado
  1: [[600, 1140]],   // lunes 10:00–19:00
  2: [[600, 1140]],
  3: [[600, 1140]],
  4: [[600, 1140]],
  5: [[600, 1140]],   // viernes
  6: [[600, 840]]     // sábado 10:00–14:00
};
// Festivos (año-mes-día) en los que la tienda cierra. Añade los vuestros.
const FESTIVOS = ['2026-11-01', '2026-12-06', '2026-12-08', '2026-12-25', '2027-01-01', '2027-01-06'];
// Días con horario especial (el mismo "horario especial" de la ficha de Google).
// 16:30 = 990, 20:00 = 1200. Cuando pasen las fechas se pueden borrar.
const HORARIO_ESPECIAL = {
  '2026-10-22': [[600, 840], [990, 1200]],
  '2026-10-23': [[600, 840], [990, 1200]],
  '2026-10-26': [[600, 840], [990, 1200]],
  '2026-10-27': [[600, 840], [990, 1200]],
  '2026-10-28': [[600, 840], [990, 1200]],
  '2026-10-29': [[600, 840], [990, 1200]],
  '2026-10-30': [[600, 840], [990, 1200]]
};

// Tramos de un día concreto: festivo, horario especial o el normal
function tramosDelDia(fecha, dia) {
  if (FESTIVOS.includes(fecha)) return [];
  return HORARIO_ESPECIAL[fecha] || HORARIO[dia];
}

function estadoTienda() {
  // Hay varios indicadores en la página (franja, cita y pie)
  const etiquetas = document.querySelectorAll('.estado-tienda');
  if (!etiquetas.length) return;

  // Hora de España, aunque quien visite la web esté en otro país
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid', weekday: 'short', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const dato = function (tipo) { return partes.find(function (p) { return p.type === tipo; }).value; };

  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dia = dias[dato('weekday')];
  const minutos = Number(dato('hour')) * 60 + Number(dato('minute'));
  const fecha = dato('year') + '-' + dato('month') + '-' + dato('day');

  const tramos = tramosDelDia(fecha, dia);
  const tramoAbierto = tramos.find(function (t) { return minutos >= t[0] && minutos < t[1]; });

  // Convierte 1200 en "20:00"
  const hora = function (m) { return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };

  // Si está cerrado, buscamos cuándo abre la próxima vez (hoy o en los días siguientes)
  let proximaApertura = '';
  if (!tramoAbierto) {
    const tramoHoy = tramos.find(function (t) { return minutos < t[0]; });
    if (tramoHoy) {
      proximaApertura = t('abreHoy', { h: hora(tramoHoy[0]) });
    } else {
      // Recorremos los días siguientes saltando festivos
      const hoyUTC = Date.UTC(Number(dato('year')), Number(dato('month')) - 1, Number(dato('day')));
      for (let i = 1; i <= 14; i++) {
        const d = (dia + i) % 7;
        const fechaSiguiente = new Date(hoyUTC + i * 86400000).toISOString().slice(0, 10);
        const tramosSiguiente = tramosDelDia(fechaSiguiente, d);
        if (tramosSiguiente.length) {
          const h = hora(tramosSiguiente[0][0]);
          proximaApertura = i === 1 ? t('abreManana', { h: h })
            : i < 7 ? t('abreDia', { d: T.dias[d], h: h })
            : t('abreDiaFecha', { d: T.dias[d], n: Number(fechaSiguiente.slice(8)), h: h });
          break;
        }
      }
    }
  }

  etiquetas.forEach(function (etiqueta) {
    etiqueta.classList.toggle('estado-tienda--abierto', Boolean(tramoAbierto));
    etiqueta.classList.toggle('estado-tienda--cerrado', !tramoAbierto);
    etiqueta.textContent = tramoAbierto
      ? t('abierto', { h: hora(tramoAbierto[1]) })
      : t('cerrado', { p: proximaApertura });
  });
}
estadoTienda();
setInterval(estadoTienda, 60000); // se actualiza cada minuto


// ---------- 9. BANNER DE COOKIES (RGPD) ----------
// Guardamos la elección en el navegador para no volver a preguntar.
// "try/catch" evita errores si el navegador bloquea el almacenamiento.
const banner = document.getElementById('cookies');
const CLAVE_COOKIES = 'senti2-cookies';

function leerEleccion() {
  try { return localStorage.getItem(CLAVE_COOKIES); } catch (e) { return null; }
}
function guardarEleccion(valor) {
  try { localStorage.setItem(CLAVE_COOKIES, valor); } catch (e) { /* sin almacenamiento */ }
  banner.hidden = true;
  if (valor === 'aceptadas') {
    // AQUÍ, y solo aquí, se cargarían las cookies de análisis
    // (por ejemplo Google Analytics) cuando las uséis.
  }
}

if (banner && !leerEleccion()) {
  banner.hidden = false;
  document.getElementById('cookies-aceptar').addEventListener('click', function () { guardarEleccion('aceptadas'); });
  document.getElementById('cookies-rechazar').addEventListener('click', function () { guardarEleccion('rechazadas'); });
}


// ---------- 10. NEWSLETTER ----------
// El formulario envía la suscripción a FormSubmit (formsubmit.co), que la
// reenvía por correo a senti2moraira@gmail.com. Aquí lo hacemos sin recargar
// la página y mostramos un mensaje de confirmación en el idioma de la web.
// Si el JavaScript fallara, el formulario funciona igual (recarga la página).
const formulario = document.querySelector('.newsletter__formulario');

if (formulario && window.fetch) {
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    let aviso = formulario.querySelector('.newsletter__aviso');
    if (!aviso) {
      aviso = document.createElement('p');
      aviso.className = 'newsletter__aviso';
      aviso.setAttribute('role', 'status');
      formulario.appendChild(aviso);
    }
    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    aviso.textContent = T.newsletterEnviando;

    fetch('https://formsubmit.co/ajax/c657af33cdbf25f8cca13b135b47ef7a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(formulario)))
    })
      .then(function (respuesta) { return respuesta.json(); })
      .then(function (datos) {
        if (datos && (datos.success === 'true' || datos.success === true)) {
          aviso.textContent = T.newsletterOk;
          formulario.reset();
        } else {
          aviso.textContent = T.newsletterError;
        }
      })
      .catch(function () { aviso.textContent = T.newsletterError; })
      .finally(function () { boton.disabled = false; });
  });
}


// ---------- 11. AÑO DEL PIE DE PÁGINA ----------
document.getElementById('anio').textContent = new Date().getFullYear();
