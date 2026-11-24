// =============================================================
// VISITA VIRTUAL 360° — recorrido por la óptica al estilo Street View
// Visor: Photo Sphere Viewer 5 (licencia MIT), en js/vendor
//
// CÓMO AÑADIR O AJUSTAR UNA FOTO:
//  - Cada "parada" es una foto 360 de img/visita-360 (6144 x 3072 px)
//    y su miniatura "-mini" (1024 x 512 px).
//  - "norte": hacia dónde mira el centro de la foto respecto a la tienda
//    (en grados). Sirve para que, al pasar de una foto a otra, sigas
//    mirando hacia el mismo sitio, igual que en Google Street View.
//  - "enlaces": flechas del suelo. "rumbo" es el ángulo dentro de ESA foto
//    (0 = centro de la foto, 90 = a la derecha, -90 = a la izquierda).
// =============================================================

import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';

const CARPETA = 'img/visita-360/';

const PARADAS = [
  {
    id: 'exterior-entrada',
    nombre: 'Entrada a la óptica',
    norte: 0,
    enlaces: [
      { a: 'entrada', rumbo: 0 },
      { a: 'exterior-esquina', rumbo: 65 },
    ],
  },
  {
    id: 'exterior-esquina',
    nombre: 'Escaparate de la esquina',
    norte: -15,
    enlaces: [
      { a: 'exterior-entrada', rumbo: -100 },
    ],
  },
  {
    id: 'entrada',
    nombre: 'Sala principal',
    norte: 0,
    enlaces: [
      { a: 'exterior-entrada', rumbo: 180 },
      { a: 'sala-vitrinas', rumbo: -25 },
      { a: 'zona-atencion', rumbo: 65 },
    ],
  },
  {
    id: 'sala-vitrinas',
    nombre: 'Vitrinas de marcas',
    norte: 60,
    enlaces: [
      { a: 'entrada', rumbo: 95 },
      { a: 'pasillo-graduadas', rumbo: -15 },
      { a: 'gabinete-optometria', rumbo: -175 },
      { a: 'zona-atencion', rumbo: 40 },
    ],
  },
  {
    id: 'pasillo-graduadas',
    nombre: 'Gafas graduadas',
    norte: 60,
    enlaces: [
      { a: 'sala-vitrinas', rumbo: 165 },
      { a: 'zona-atencion', rumbo: 85 },
    ],
  },
  {
    id: 'zona-atencion',
    nombre: 'Zona de atención',
    norte: 100,
    enlaces: [
      { a: 'entrada', rumbo: 145 },
      { a: 'sala-vitrinas', rumbo: -175 },
      { a: 'pasillo-graduadas', rumbo: -135 },
    ],
  },
  {
    id: 'gabinete-optometria',
    nombre: 'Gabinete de optometría',
    norte: -145, // foto IMG_20261119_015 (sustituye a la 014)
    enlaces: [
      { a: 'sala-vitrinas', rumbo: -120 },
    ],
  },
];

const porId = Object.fromEntries(PARADAS.map((p) => [p.id, p]));
const rad = (g) => (g * Math.PI) / 180;
const grados = (r) => (r * 180) / Math.PI;

// Disco con el logo que tapa el trípode en el suelo (4 esquinas sobre la esfera)
const NADIR_PITCH = -60;
const nadir = {
  id: 'nadir',
  imageLayer: CARPETA + 'nadir.svg',
  position: [
    { yaw: rad(-45), pitch: rad(NADIR_PITCH) },
    { yaw: rad(45), pitch: rad(NADIR_PITCH) },
    { yaw: rad(135), pitch: rad(NADIR_PITCH) },
    { yaw: rad(-135), pitch: rad(NADIR_PITCH) },
  ],
  opacity: 0.95,
};

const nodos = PARADAS.map((p) => ({
  id: p.id,
  panorama: CARPETA + p.id + '.jpg',
  thumbnail: CARPETA + p.id + '-mini.jpg',
  name: p.nombre,
  links: p.enlaces.map((e) => ({
    nodeId: e.a,
    position: { yaw: rad(e.rumbo), pitch: 0 },
  })),
  markers: [nadir],
}));

const viewer = new Viewer({
  container: document.getElementById('visor'),
  defaultYaw: 0,
  defaultPitch: rad(-4),
  defaultZoomLvl: 20,
  minFov: 30,
  maxFov: 100,
  mousewheelCtrlKey: false,
  touchmoveTwoFingers: false,
  loadingImg: 'img/logo/senti2-logo.svg',
  navbar: ['zoom', 'move', 'gallery', 'fullscreen'],
  lang: {
    zoom: 'Zoom',
    zoomOut: 'Alejar',
    zoomIn: 'Acercar',
    moveUp: 'Mirar arriba',
    moveDown: 'Mirar abajo',
    moveLeft: 'Girar a la izquierda',
    moveRight: 'Girar a la derecha',
    fullscreen: 'Pantalla completa',
    menu: 'Menú',
    close: 'Cerrar',
    loading: 'Cargando…',
    loadError: 'No se ha podido cargar la foto',
    twoFingers: 'Usa dos dedos para moverte',
    ctrlZoom: 'Usa Ctrl + rueda para hacer zoom',
    gallery: 'Estancias',
  },
  plugins: [
    MarkersPlugin,
    [GalleryPlugin, { thumbnailSize: { width: 160, height: 90 }, hideOnClick: true }],
    [VirtualTourPlugin, {
      positionMode: 'manual',
      renderMode: '3d',
      nodes: nodos,
      startNodeId: 'exterior-entrada',
      preload: true,
      arrowsPosition: { minPitch: 0.35, maxPitch: Math.PI / 2, linkPitchOffset: -0.1 },
      // Al cruzar una flecha seguimos mirando en la misma dirección (como en Street View)
      transitionOptions: (destino, origen, enlace) => {
        if (!origen || !enlace) {
          return { effect: 'fade', rotation: false, showLoader: true };
        }
        // Dirección de la flecha pulsada, pasada al "norte" común de la tienda
        const rumboMundo = grados(enlace.position.yaw) + porId[origen.id].norte;
        const yaw = rad(rumboMundo - porId[destino.id].norte);
        return {
          effect: 'fade',
          speed: 900,
          rotation: true,
          showLoader: true,
          rotateTo: { yaw, pitch: rad(-4) },
          zoomTo: viewer.getZoomLevel(),
        };
      },
      getLinkTooltip: (contenido, enlace) => porId[enlace.nodeId]?.nombre ?? '',
    }],
  ],
});

// Título de la barra superior según la estancia
const tour = viewer.getPlugin(VirtualTourPlugin);
const titulo = document.getElementById('visita-lugar');
tour.addEventListener('node-changed', ({ node }) => {
  titulo.textContent = node.name;
  document.title = `${node.name} · Visita virtual 360° · Senti2 Óptica`;
});

// La ayuda desaparece en cuanto la persona empieza a moverse
const ayuda = document.getElementById('visita-ayuda');
const ocultarAyuda = () => ayuda.classList.add('visita__ayuda--oculta');
viewer.addEventListener('position-updated', ocultarAyuda, { once: true });
setTimeout(ocultarAyuda, 9000);
