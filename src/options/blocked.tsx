import { SyncStorage } from "../background/controllers/storage";
import "../index.css";
import { DOM, html } from "../utils/Dom";

const App = html`
  <main
    class="grid place-content-center h-screen w-screen bg-gray-50 text-gray-800"
  >
    <section class="p-4 space-y-2 max-w-md text-center">
      <h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl">
        Blocked... Think About Your Dreams Bro.
      </h1>
      <p class="text-lg text-gray-500">
        The truth is, life is short. Stop wasting it on things that don't
        matter.
      </p>
      <div id="custom-message-container" class="mt-4"></div>
    </section>
  </main>
`;

const appElement = DOM.createDomElement(App);
document.body.appendChild(appElement);

async function init() {
  const customMessage = await SyncStorage.get("customBlockMessage");
  if (customMessage) {
    const customMessageContainer = appElement.querySelector(
      "#custom-message-container"
    );
    const customMessageElement = DOM.createDomElement(
      html`<p class="text-lg text-gray-600 font-semibold">${customMessage}</p>`
    );
    customMessageContainer.appendChild(customMessageElement);
  }
}

init();
