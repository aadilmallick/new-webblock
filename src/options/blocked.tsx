import "../index.css";
import { DOM, html } from "../utils/Dom";

const App = html`
  <section>
    <h1>Blocked...</h1>
  </section>
`;

const appElement = DOM.createDomElement(App);
document.body.appendChild(appElement);
