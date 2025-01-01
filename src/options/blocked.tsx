import "../index.css";
import { DOM, html } from "../utils/Dom";

const App = html`
  <section class="p-4 space-y-2">
    <h1 class="text-2xl">Blocked... Think About Your Dreams Bro.</h1>
    <p class="text-base text-gray-400">
      The truth is, life is short. Stop wasting it on things that don't matter.
    </p>
  </section>
`;

const appElement = DOM.createDomElement(App);
document.body.appendChild(appElement);
