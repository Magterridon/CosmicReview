/**
 * Cosmic Review — le son.
 *
 * Une petite régie plutôt qu'une bibliothèque : trois ambiances qui ne jouent
 * jamais ensemble (la cour, puis le désert, puis la musique de fin, chacune
 * fondue dans la suivante) et des effets ponctuels déclenchés par la scène —
 * la cassette, l'éclair, le moteur qui démarre.
 *
 * Les navigateurs coupent tout son tant qu'on n'a rien cliqué : rien ne joue
 * avant le premier geste sur la page, quelle que soit la scène où il a lieu.
 * Le silence choisi, lui, est retenu d'une visite à l'autre.
 */

const KEY = "cr-son";
const FADE = 1100;

/** Effets courts, joués une fois. Un fichier manquant échoue en silence :
 *  on peut brancher un nouvel effet, ou le remplacer, sans toucher au code
 *  qui l'appelle. */
const FX = {
  "camcorder-open": "/audio/camcorder-open.mp3",
  "cassette-insert": "/audio/cassette-insert.mp3",
  lightning: "/audio/lightning.mp3",
  "car-start": "/audio/car-start.mp3",
  scratch: "/audio/scratch.mp3",
};

/** Ambiances en boucle, une par état de la scène « Le Projet ».
 *  `fin` est la musique du générique, posée à sa toute dernière page —
 *  quand le générique s'arrête sur l'équipe rangée sous le titre. */
const LOOPS = {
  cour: "/audio/night-ambiance.mp3",
  desert: "/audio/desert-ambiance.mp3",
  fin: "/audio/space-end.mp3",
};

/** Volume de croisière de chaque boucle : les ambiances restent en retrait,
 *  la musique de fin, elle, est ce qu'il reste à écouter — elle peut porter. */
const NIVEAU = { cour: 0.5, desert: 0.5, fin: 0.68 };

export function initAudio() {
  let muted = false;
  try {
    muted = localStorage.getItem(KEY) === "off";
  } catch (err) {
    /* stockage indisponible (navigation privée…) : on reste par défaut audible */
  }

  let unlocked = false;
  let queued = null;       // la boucle à lancer dès le premier geste
  let current = null;      // "cour" | "desert" | null
  const els = {};

  function elFor(loop) {
    if (els[loop]) return els[loop];
    const audio = new Audio(LOOPS[loop]);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0;
    els[loop] = audio;
    return audio;
  }

  /** Fondu de volume, sur `ms` : on ne coupe jamais net une ambiance. */
  function fade(audio, to, ms) {
    const from = audio.volume;
    if (Math.abs(from - to) < 0.01) {
      audio.volume = to;
      if (to === 0) audio.pause();
      return;
    }
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      audio.volume = from + (to - from) * p;
      if (p < 1) requestAnimationFrame(step);
      else if (to === 0) audio.pause();
    };
    requestAnimationFrame(step);
  }

  /** Joue `loop`, en fondant l'ambiance précédente. Sans effet si elle joue déjà. */
  function playLoop(loop) {
    if (!LOOPS[loop] || current === loop) return;
    const prev = current && els[current];
    current = loop;
    if (muted || !unlocked) {
      queued = loop;
      return;
    }
    const audio = elFor(loop);
    audio.play().catch(() => {});
    fade(audio, NIVEAU[loop] || 0.5, FADE);
    if (prev) fade(prev, 0, FADE);
  }

  function stopLoops() {
    current = null;
    queued = null;
    Object.values(els).forEach((a) => fade(a, 0, FADE));
  }

  /** Un effet ponctuel, avec un délai facultatif — pour caler le moteur
   *  après l'éclair sans multiplier les `setTimeout` dans `projet.js`. */
  function playFx(name, { volume = 0.85, delay = 0 } = {}) {
    if (!FX[name] || muted) return;
    const go = () => {
      if (!unlocked) return;
      try {
        const audio = new Audio(FX[name]);
        audio.volume = volume;
        audio.play().catch(() => {});
      } catch (err) {
        /* fichier absent ou format refusé : on ne casse pas la scène pour ça */
      }
    };
    if (delay) window.setTimeout(go, delay);
    else go();
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (queued) {
      const loop = queued;
      queued = null;
      current = null;
      playLoop(loop);
    }
  }

  ["pointerdown", "keydown"].forEach((ev) =>
    window.addEventListener(ev, unlock, { once: true, passive: true })
  );

  /* -------------------------------------------------------- le bouton */

  const btn = document.querySelector("[data-son]");

  function paint() {
    if (!btn) return;
    btn.setAttribute("aria-pressed", String(!muted));
    btn.dataset.state = muted ? "off" : "on";
  }

  function setMuted(v) {
    muted = v;
    try {
      localStorage.setItem(KEY, v ? "off" : "on");
    } catch (err) {
      /* rien à faire sans stockage : la préférence ne survivra pas à la visite */
    }
    if (v) {
      Object.values(els).forEach((a) => fade(a, 0, 300));
    } else if (current) {
      const loop = current;
      current = null;
      playLoop(loop);
    }
    paint();
  }

  if (btn) {
    paint();
    btn.addEventListener("click", () => setMuted(!muted));
  }

  return { playLoop, stopLoops, playFx };
}
