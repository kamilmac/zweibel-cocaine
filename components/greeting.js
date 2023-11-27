import {
  LitElement,
  html,
  css,
  asyncReplace,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

async function* countDown(count) {
  while (count > 0) {
    yield count--;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

class SimpleGreeting extends LitElement {
  static properties = {
    timer: { state: true },
    name: { type: String },
    test: { type: String },
  };

  static styles = css`
    p {
      color: blue;
    }
  `;

  constructor() {
    super();
    this.timer = countDown(10);
    this.name = "Somebody";
  }

  render() {
    console.log(this.test)
    return html`<p>Hello, ${this.name}! <span>${asyncReplace(this.timer)}</span></p>`;
  }
}

customElements.define("simple-greeting", SimpleGreeting);
