'use strict';
const invitation = document.getElementById('invitation');
const reveal = document.getElementById('reveal');
const video = document.getElementById('ultrasound');
const audio = document.getElementById('heartbeat');
const pause = document.getElementById('pause');
const mute = document.getElementById('mute');
const status = document.getElementById('media-status');
const loading = document.getElementById('video-loading');
let paused = true;
let revealing = false;
let timer;
let soundContext;
let heartbeatGain;
const cork = document.getElementById('discover');
const openingStatus = document.getElementById('opening-status');
let oceanSource;
let oceanGain;
const oceanToggle = document.getElementById('ocean-toggle');
const oceanStatus = document.getElementById('ocean-status');
function ensureSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  if (!soundContext) {
    soundContext = new AudioContextClass();
    heartbeatGain = soundContext.createGain();
    const source = soundContext.createMediaElementSource(audio);
    source.connect(heartbeatGain).connect(soundContext.destination);
  }
  return true;
}
function prepareSound() {
  if (!ensureSound()) return false;
  heartbeatGain.gain.setValueAtTime(0, soundContext.currentTime);
  soundContext.resume().catch(() => {});
  return true;
}
function stopOcean() {
  if (oceanSource) {
    oceanGain.gain.setTargetAtTime(0, soundContext.currentTime, 0.12);
    oceanSource.stop(soundContext.currentTime + 0.5);
    oceanSource = null;
  }
  oceanToggle.textContent = 'Ouvir o mar';
  oceanToggle.setAttribute('aria-pressed', 'false');
}
async function startOcean() {
  if (oceanSource || oceanToggle.disabled) return;
  oceanToggle.disabled = true;
  try {
    if (!ensureSound()) throw new Error('Audio unavailable');
    await soundContext.resume();
    if (revealing) return;
    const duration = 12;
    const buffer = soundContext.createBuffer(1, soundContext.sampleRate * duration, soundContext.sampleRate);
    const data = buffer.getChannelData(0);
    let smooth = 0;
    for (let i = 0; i < data.length; i++) {
      smooth = 0.97 * smooth + 0.03 * (Math.random() * 2 - 1);
      const swell = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (data.length - 1));
      data[i] = smooth * 4 * swell;
    }
    oceanSource = soundContext.createBufferSource();
    oceanSource.buffer = buffer; oceanSource.loop = true;
    const filter = soundContext.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 1100;
    oceanGain = soundContext.createGain(); oceanGain.gain.value = 0.28;
    oceanSource.connect(filter).connect(oceanGain).connect(soundContext.destination);
    oceanSource.start();
    oceanToggle.textContent = 'Silenciar o mar';
    oceanToggle.setAttribute('aria-pressed', 'true');
    oceanStatus.textContent = '';
  } catch (_) {
    oceanStatus.textContent = 'O som não iniciou. Toque novamente para tentar.';
  } finally { oceanToggle.disabled = false; }
}
oceanToggle.addEventListener('click', () => {
  if (oceanSource) stopOcean();
  else startOcean();
});
document.getElementById('open-message').addEventListener('click', () => {
  // Resume the audio context directly from this first user gesture.
  startOcean();
  document.getElementById('welcome').hidden = true;
  invitation.hidden = false;
  cork.focus({preventScroll:true});
});
function corkPop() {
  if (!soundContext) return;
  const now = soundContext.currentTime;
  const duration = 0.48;
  const buffer = soundContext.createBuffer(1, Math.ceil(soundContext.sampleRate * duration), soundContext.sampleRate);
  const samples = buffer.getChannelData(0);
  let smooth = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / soundContext.sampleRate;
    const noise = Math.random() * 2 - 1;
    smooth = 0.72 * smooth + 0.28 * noise;
    // Short cork friction, then a low hollow pressure release and airy decay.
    const friction = t < 0.075 ? smooth * 0.12 * Math.sin(Math.PI * t / 0.075) : 0;
    const u = Math.max(0, t - 0.075);
    const attack = t < 0.075 ? 0 : Math.min(1, u / 0.003);
    const body = Math.sin(2 * Math.PI * (185 * u + 8 * (1 - Math.exp(-u * 35)))) * 0.58 * Math.exp(-u * 33);
    const resonance = Math.sin(2 * Math.PI * 420 * u) * 0.1 * Math.exp(-u * 24);
    const air = smooth * 0.38 * Math.exp(-u * 30);
    const tail = Math.min(1, (duration - t) / 0.02);
    samples[i] = (friction + attack * (body + resonance + air)) * tail;
  }
  const source = soundContext.createBufferSource();
  const gain = soundContext.createGain();
  source.buffer = buffer;
  gain.gain.value = 0.65;
  source.connect(gain).connect(soundContext.destination);
  source.onended = () => { source.disconnect(); gain.disconnect(); };
  source.start(now);
}
async function playMedia() {
  status.textContent = '';
  if (soundContext) soundContext.resume().catch(() => {});
  const results = await Promise.allSettled([video.play(), audio.play()]);
  paused = results.every(result => result.status === 'rejected');
  pause.textContent = paused ? 'Reproduzir' : 'Pausar';
  if (results.some(result => result.status === 'rejected')) {
    status.textContent = 'Não foi possível iniciar tudo. Toque em reproduzir para tentar de novo.';
    video.pause(); audio.pause(); paused = true; pause.textContent = 'Reproduzir';
  }
}
cork.addEventListener('click', () => {
  if (revealing) return;
  revealing = true;
  cork.disabled = true;
  stopOcean();
  let soundReady = false;
  try { soundReady = prepareSound(); corkPop(); } catch (_) { /* Playback remains available through the video controls. */ }
  // Start during the user gesture, with a Web Audio gain of zero until reveal.
  if (soundReady) playMedia();
  invitation.classList.add('uncorking');
  openingStatus.textContent = 'Um segredinho está saindo da garrafa…';
  timer = setTimeout(() => {
    invitation.hidden = true;
    reveal.hidden = false;
    video.currentTime = 0; audio.currentTime = 0;
    if (heartbeatGain) heartbeatGain.gain.setTargetAtTime(1, soundContext.currentTime, 0.08);
    if (!soundReady) playMedia();
    document.getElementById('reveal-title').focus({preventScroll:true});
    window.scrollTo({top:0, behavior:'instant'});
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 3600);
});
pause.addEventListener('click', () => {
  if (paused) { playMedia(); return; }
  video.pause(); audio.pause(); paused = true; pause.textContent = 'Reproduzir';
});
mute.addEventListener('click', () => {
  audio.muted = !audio.muted;
  mute.textContent = audio.muted ? 'Ativar som' : 'Silenciar';
  mute.setAttribute('aria-pressed', String(audio.muted));
});
video.addEventListener('playing', () => { loading.hidden = true; });
video.addEventListener('waiting', () => { loading.hidden = false; });
for (const media of [video, audio]) media.addEventListener('error', () => {
  status.textContent = 'O arquivo não carregou. Confira sua conexão e tente reproduzir novamente.';
  loading.hidden = true;
});
document.getElementById('restart').addEventListener('click', () => {
  clearTimeout(timer);
  video.pause(); audio.pause(); video.currentTime = 0; audio.currentTime = 0;
  paused = true; revealing = false; pause.textContent = 'Pausar';
  reveal.hidden = true; invitation.hidden = false; invitation.classList.remove('uncorking');
  cork.disabled = false; openingStatus.textContent = '';
  if (heartbeatGain) heartbeatGain.gain.setValueAtTime(0, soundContext.currentTime);
  status.textContent = '';
  startOcean();
  document.getElementById('discover').focus({preventScroll:true});
  window.scrollTo({top:0, behavior:'instant'});
});
