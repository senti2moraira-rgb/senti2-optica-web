// =====================================================================
// PROBADOR VIRTUAL DE GAFAS
// Usa MediaPipe Face Landmarker (se carga desde el CDN de jsDelivr y el
// modelo desde Google) para encontrar los ojos y colocar la montura.
// Todo se ejecuta en el navegador: ninguna imagen sale del dispositivo.
// Para añadir una montura: pon su PNG con fondo transparente en img/probador/
// y añade una línea a la lista MONTURAS.
// =====================================================================
import { FaceLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';

const MONTURAS = [
  { id: 'pementa-redondela',       marca: 'Pementa',          modelo: 'Redondela',        tipo: 'graduada' },
  { id: 'pementa-arnela',          marca: 'Pementa',          modelo: 'Arnela',           tipo: 'graduada' },
  { id: 'anne-et-valentin-wellok', marca: 'Anne et Valentin', modelo: 'Wellok',           tipo: 'graduada' },
  { id: 'dita-grand-deus',         marca: 'Dita',             modelo: 'Grand-Deus',       tipo: 'graduada' },
  { id: 'face-a-face-bahia',       marca: 'Face à Face',      modelo: 'Bahia',            tipo: 'graduada' },
  { id: 'la-eyeworks-sunfish',     marca: 'L.A. Eyeworks',    modelo: 'Sunfish',          tipo: 'graduada' },
  { id: 'dior-diorbutterfly-s1i',  marca: 'Dior',             modelo: 'DiorButterfly S1I', tipo: 'sol' },
  { id: 'face-a-face-frost-2',     marca: 'Face à Face',      modelo: 'Frost 2',          tipo: 'sol' },
  { id: 'dita-mach-five',          marca: 'Dita',             modelo: 'Mach-Five',        tipo: 'sol' },
  { id: 'dita-grandmaster-eight',  marca: 'Dita',             modelo: 'Grandmaster-Eight', tipo: 'sol' },
  { id: 'anne-et-valentin-spiral', marca: 'Anne et Valentin', modelo: 'Spiral',           tipo: 'sol' },
  { id: 'pementa-verin',           marca: 'Pementa',          modelo: 'Verín',            tipo: 'sol' },
];

const video = document.getElementById('camara');
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
const inicio = document.getElementById('inicio');
const estado = document.getElementById('estado');
const btnCamara = document.getElementById('btn-camara');
const subirFoto = document.getElementById('subir-foto');
const btnFoto = document.getElementById('btn-foto');
const btnCambiar = document.getElementById('btn-cambiar');
const btnGirar = document.getElementById('btn-girar');
const btnWhatsapp = document.getElementById('btn-whatsapp');
const nombreModelo = document.getElementById('modelo-nombre');
const listaMonturas = document.getElementById('monturas');
const ajusteTamano = document.getElementById('ajuste-tamano');
const ajusteAltura = document.getElementById('ajuste-altura');

let landmarker = null;
let modo = null;              // 'camara' | 'foto'
let foto = null;              // imagen subida
let rotacion = 0;             // giro manual de la foto (0, 90, 180, 270)
let puntosFoto = null;        // cara detectada en la foto
let flujo = null;             // stream de la cámara
let animacion = null;
let actual = MONTURAS[0];
const imagenes = {};          // PNG de cada montura ya cargado

function mostrarEstado(texto) {
  estado.textContent = texto;
  estado.hidden = !texto;
}

// ---------- Monturas ----------
function cargarImagen(m) {
  if (imagenes[m.id]) return imagenes[m.id];
  const img = new Image();
  img.src = 'img/probador/' + m.id + '.png';
  imagenes[m.id] = img;
  return img;
}

MONTURAS.forEach(function (m) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'probador__montura' + (m === actual ? ' probador__montura--activa' : '');
  boton.setAttribute('role', 'option');
  boton.setAttribute('aria-selected', m === actual);
  boton.innerHTML = '<img src="img/probador/' + m.id + '.png" alt="" loading="lazy"><span>' + m.marca + '<br><strong>' + m.modelo + '</strong></span>';
  boton.addEventListener('click', function () {
    actual = m;
    listaMonturas.querySelectorAll('.probador__montura').forEach(function (b) {
      b.classList.toggle('probador__montura--activa', b === boton);
      b.setAttribute('aria-selected', b === boton);
    });
    nombreModelo.textContent = m.marca + ' · ' + m.modelo;
    btnWhatsapp.href = 'https://wa.me/34722258384?text=' + encodeURIComponent('Hola, me he probado las ' + m.marca + ' ' + m.modelo + ' en el probador de la web y me gustaría verlas en tienda.');
    if (modo === 'foto') dibujarFoto();
  });
  listaMonturas.appendChild(boton);
  cargarImagen(m);
});

// ---------- Detector de caras ----------
async function prepararDetector(runningMode) {
  if (!landmarker) {
    mostrarEstado('Preparando el probador…');
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
    const opciones = {
      baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task', delegate: 'GPU' },
      runningMode: runningMode,
      numFaces: 1
    };
    try {
      landmarker = await FaceLandmarker.createFromOptions(vision, opciones);
    } catch (e) {
      opciones.baseOptions.delegate = 'CPU';
      landmarker = await FaceLandmarker.createFromOptions(vision, opciones);
    }
    mostrarEstado('');
  } else {
    await landmarker.setOptions({ runningMode: runningMode });
  }
}

// ---------- Colocar las gafas ----------
// Puntos de MediaPipe: 33 y 263 = rabillos externos de los ojos, 168 = entrecejo.
function dibujarGafas(puntos, ancho, alto, espejo) {
  const p = function (i) { return { x: (espejo ? 1 - puntos[i].x : puntos[i].x) * ancho, y: puntos[i].y * alto }; };
  const entrecejo = p(168);
  // Ordenamos los rabillos de izquierda a derecha EN LA IMAGEN: así el ángulo
  // sale bien tanto en la foto como en la cámara en espejo (antes, en espejo,
  // el orden se invertía y la montura se dibujaba boca abajo).
  let izq = p(33), der = p(263);
  if (der.x < izq.x) { const t = izq; izq = der; der = t; }
  const distancia = Math.hypot(der.x - izq.x, der.y - izq.y);
  const angulo = Math.atan2(der.y - izq.y, der.x - izq.x);
  const img = cargarImagen(actual);
  if (!img.complete || !img.naturalWidth) return;
  const anchoGafas = distancia * parseFloat(ajusteTamano.value);
  const altoGafas = anchoGafas * img.naturalHeight / img.naturalWidth;
  // Giro de la cabeza: el entrecejo se desplaza respecto al centro de los ojos
  const centroX = (izq.x + der.x) / 2, centroY = (izq.y + der.y) / 2;
  const giro = Math.max(-0.5, Math.min(0.5, (entrecejo.x - centroX) / distancia));
  ctx.save();
  ctx.translate(centroX + giro * distancia * 0.35, centroY + parseFloat(ajusteAltura.value) * distancia * 0.5);
  ctx.rotate(angulo);
  // En espejo, la montura también se refleja (como la verías en un espejo real)
  ctx.scale((1 - Math.abs(giro) * 0.6) * (espejo ? -1 : 1), 1);
  ctx.drawImage(img, -anchoGafas / 2, -altoGafas * 0.47, anchoGafas, altoGafas);
  ctx.restore();
}

// ---------- Modo cámara ----------
async function iniciarCamara() {
  try {
    btnCamara.disabled = true;
    await prepararDetector('VIDEO');
    flujo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 1280 } }, audio: false });
    video.srcObject = flujo;
    await video.play();
    modo = 'camara';
    inicio.hidden = true;
    btnFoto.disabled = false;
    btnCambiar.hidden = false;
    lienzo.width = video.videoWidth || 960;
    lienzo.height = video.videoHeight || 1280;
    let ultimo = -1;
    let sinCara = 0;
    const bucle = function () {
      if (modo !== 'camara') return;
      // La cámara frontal se muestra en espejo, como un espejo de verdad
      ctx.save(); ctx.translate(lienzo.width, 0); ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, lienzo.width, lienzo.height);
      ctx.restore();
      const ahora = performance.now();
      if (ahora !== ultimo) {
        ultimo = ahora;
        const r = landmarker.detectForVideo(video, ahora);
        if (r.faceLandmarks && r.faceLandmarks[0]) {
          sinCara = 0; mostrarEstado('');
          dibujarGafas(r.faceLandmarks[0], lienzo.width, lienzo.height, true);
        } else if (++sinCara > 15) {
          mostrarEstado('No vemos tu cara: acércate, mira de frente y busca buena luz.');
        }
      }
      animacion = requestAnimationFrame(bucle);
    };
    bucle();
  } catch (e) {
    btnCamara.disabled = false;
    mostrarEstado('No hemos podido usar la cámara. Comprueba el permiso del navegador o sube una foto.');
  }
}

// ---------- Modo foto ----------
// Dibuja la foto (con el giro manual que toque) y las gafas encima
function pintarFotoBase() {
  const w = foto.width || foto.naturalWidth, h = foto.height || foto.naturalHeight;
  const girada = rotacion % 180 !== 0;
  const escala = Math.min(1, 1280 / Math.max(w, h));
  lienzo.width = Math.round((girada ? h : w) * escala);
  lienzo.height = Math.round((girada ? w : h) * escala);
  ctx.save();
  ctx.translate(lienzo.width / 2, lienzo.height / 2);
  ctx.rotate(rotacion * Math.PI / 180);
  ctx.drawImage(foto, -w * escala / 2, -h * escala / 2, w * escala, h * escala);
  ctx.restore();
}
function dibujarFoto() {
  if (!foto) return;
  pintarFotoBase();
  if (puntosFoto) dibujarGafas(puntosFoto, lienzo.width, lienzo.height, false);
}
function detectarEnFoto() {
  pintarFotoBase();
  const r = landmarker.detect(lienzo);
  puntosFoto = (r.faceLandmarks && r.faceLandmarks[0]) || null;
  mostrarEstado(puntosFoto ? '' : 'No encontramos una cara en la foto. Prueba con otra, de frente y bien iluminada, o gírala con el botón.');
  dibujarFoto();
}

async function cargarFoto(archivo) {
  try {
    await prepararDetector('IMAGE');
    rotacion = 0;
    // createImageBitmap respeta la orientación que guarda la cámara del móvil (EXIF):
    // así las fotos no salen giradas. Si el navegador no lo soporta, usamos <img>.
    try {
      foto = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    } catch (e) {
      const url = URL.createObjectURL(archivo);
      foto = new Image();
      await new Promise(function (ok, mal) { foto.onload = ok; foto.onerror = mal; foto.src = url; });
    }
    detenerCamara();
    modo = 'foto';
    inicio.hidden = true;
    btnFoto.disabled = false;
    btnCambiar.hidden = false;
    btnGirar.hidden = false;
    detectarEnFoto();
  } catch (e) {
    mostrarEstado('No hemos podido abrir esa foto. Prueba con otra imagen.');
  }
}

function detenerCamara() {
  if (animacion) cancelAnimationFrame(animacion);
  if (flujo) { flujo.getTracks().forEach(function (t) { t.stop(); }); flujo = null; }
  video.srcObject = null;
}

function volverAlInicio() {
  detenerCamara();
  modo = null; foto = null; puntosFoto = null;
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  inicio.hidden = false;
  btnFoto.disabled = true;
  btnCambiar.hidden = true;
  btnGirar.hidden = true;
  btnCamara.disabled = false;
  mostrarEstado('');
}

// ---------- Guardar la foto ----------
function guardarFoto() {
  lienzo.toBlob(function (blob) {
    if (!blob) return;
    const archivo = new File([blob], 'senti2-probador-' + actual.id + '.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      navigator.share({ files: [archivo], title: 'Mis gafas en Senti2 Óptica' }).catch(function () {});
    } else {
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(blob);
      enlace.download = archivo.name;
      enlace.click();
    }
  }, 'image/jpeg', 0.92);
}

btnCamara.addEventListener('click', iniciarCamara);
subirFoto.addEventListener('change', function () { if (subirFoto.files[0]) cargarFoto(subirFoto.files[0]); });
btnFoto.addEventListener('click', guardarFoto);
btnCambiar.addEventListener('click', volverAlInicio);
btnGirar.addEventListener('click', function () { if (modo !== 'foto') return; rotacion = (rotacion + 90) % 360; detectarEnFoto(); });
ajusteTamano.addEventListener('input', function () { if (modo === 'foto') dibujarFoto(); });
ajusteAltura.addEventListener('input', function () { if (modo === 'foto') dibujarFoto(); });
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) btnCamara.hidden = true;
