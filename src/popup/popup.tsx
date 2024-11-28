import React from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import "./popup.css";
import Toaster from "../utils/web-components/Toaster";

Toaster.registerSelf();

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       "toaster-element": React.DetailedHTMLProps<
//         React.HTMLAttributes<HTMLElement>,
//         HTMLElement
//       >;
//     }
//   }
// }

const App: React.FC<{}> = () => {
  return (
    <div>
      <p className="text-white text-2xl underline font-black">Hello world</p>
      <button
        className="bg-white px-3 py-1 rounded"
        onClick={() => {
          Toaster.toast("Hello world");
        }}
      >
        Toast
      </button>
      {/* this is how you refer to assets: they live in the static folder, and you refer to them
      absolutely. */}
      <toaster-element data-position="bottom-right"></toaster-element>
    </div>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
