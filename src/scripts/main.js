/**
 * Cosmic Review — point d'entrée du navigateur.
 *
 * Assemble les six morceaux : le ciel animé, le routeur de scènes, le
 * désert du Projet, le monde à la craie de l'Équipe, la galaxie des
 * Partenaires et la régie sonore. Tout le reste de la page est déjà là,
 * en HTML statique.
 */

import { initSky } from "./skyfx.js";
import { initRouter } from "./router.js";
import { initTeam } from "./team.js";
import { initProjet } from "./projet.js";
import { initPartenaires } from "./partenaires.js";
import { initAudio } from "./audio.js";

const audio = initAudio();
const sky = initSky();
const team = initTeam();
const projet = initProjet(audio);
const partenaires = initPartenaires();

initRouter({
  onEnter(id, { initial }) {
    // Les météores et la parallaxe ne tournent que sur la scène du ciel.
    sky.setActive(id === "ciel");

    if (id === "le-projet") projet.enter();
    else projet.leave();

    // Le saut en hyperespace se rejoue à chaque arrivée, y compris au tout
    // premier chargement de /partenaires : le lien direct a droit au voyage.
    if (id === "partenaires") {
      if (initial) requestAnimationFrame(() => partenaires.enter());
      else partenaires.enter();
    } else {
      partenaires.leave();
    }

    if (id === "equipe") {
      // Le monde se redessine à chaque arrivée, y compris au tout premier
      // chargement de /equipe : le lien direct a droit à la même entrée.
      if (initial) requestAnimationFrame(() => team.enter());
      else team.enter();
    } else {
      team.close();
    }
  },
});
