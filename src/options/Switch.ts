import { DOM, html } from "../utils/Dom";

export class Switch {
  private setHTML() {
    return html`<label class="switch">
      <input type="checkbox" />
      <span class="slider"></span>
    </label>`;
  }

  public switchContainer: HTMLElement;
  public switch: HTMLInputElement;
  constructor(checked: boolean = false) {
    this.switchContainer = DOM.createDomElement(this.setHTML());
    this.switch = this.switchContainer.querySelector("input")!;
    checked ? this.setChecked(checked) : this.setChecked(checked);
  }

  setChecked(checked: boolean) {
    this.switch.checked = checked;
  }

  public static get selector() {
    return ".switch:has(input[type='checkbox'])";
  }

  public get content() {
    return this.switchContainer;
  }

  onCheckedChange(callback: (checked: boolean) => void, signal?: AbortSignal) {
    this.switch.addEventListener(
      "change",
      () => {
        callback(this.switch.checked);
      },
      {
        signal,
      }
    );
  }
}
