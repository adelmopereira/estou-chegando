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
async function playMedia() {
  status.textContent = '';
  const results = await Promise.allSettled([video.play(), audio.play()]);
  paused = results.every(result => result.status === 'rejected');
  pause.textContent = paused ? 'Reproduzir' : 'Pausar';
  if (results.some(result => result.status === 'rejected')) {
    status.textContent = 'Não foi possível iniciar tudo. Toque em reproduzir para tentar de novo.';
    video.pause(); audio.pause(); paused = true; pause.textContent = 'Reproduzir';
  }
}
document.getElementById('discover').addEventListener('click', () => {
  if (revealing) return;
  revealing = true;
  // Both play calls must happen in the tap event to enable audio on mobile.
  playMedia();
  invitation.classList.add('leaving');
  timer = setTimeout(() => {
    invitation.hidden = true;
    reveal.hidden = false;
    document.getElementById('reveal-title').focus({preventScroll:true});
    window.scrollTo({top:0, behavior:'instant'});
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
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
  reveal.hidden = true; invitation.hidden = false; invitation.classList.remove('leaving');
  status.textContent = '';
  document.getElementById('discover').focus({preventScroll:true});
  window.scrollTo({top:0, behavior:'instant'});
});
