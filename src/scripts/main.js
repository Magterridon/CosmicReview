/**
 * Cosmic Review — point d'entrée du navigateur.
 *
 * Assemble les quatre morceaux : le ciel animé, le routeur de scènes, le
 * désert du Projet et le monde à la craie de l'Équipe. Tout le reste de la
 * page est déjà là, en HTML statique.
 */

import { initSky } from "./skyfx.js";
import { initRouter } from "./router.js";
import { initTeam } from "./team.js";
import { initProjet } from "./projet.js";

const sky = initSky();
const team = initTeam();
const projet = initProjet();

initRouter({
  onEnter(id, { initial }) {
    // Les météores et la parallaxe ne tournent que sur la scène du ciel.
    sky.setActive(id === "ciel");

    if (id === "le-projet") projet.enter();
    else projet.leave();

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
