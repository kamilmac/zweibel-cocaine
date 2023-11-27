import { html, css, LitElement } from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

class Arrow extends LitElement {
  static styles = css`
    :host {
      width: 30px;
      height: 30px;
      color: #FFFFFF;
      background-color: #000000; /* Black color for arrows */
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: transform 0.3s;
    }
    
    :host(:hover) {
      transform: scale(1.1);
    }
  `;
  
  render() {
    return html`
      <slot></slot>
    `;
  }
}

class FullLayout extends LitElement {
  static properties = {
    clickCount: { type: Number },
  };

  constructor() {
    super();
    this.clickCount = 0;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      background-color: #FFFFFF; /* White background */
    }
    
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background-color: #FFFFFF; /* Black color for footer */
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
    }
  `;
  
  render() {
    return html`
      <div>
        <hamburger-menu></hamburger-menu>
        <div class="footer">
          <arrow-button @click="${this._incrementClickCount}">←</arrow-button>
          <span>${this.clickCount}</span>
          <arrow-button @click="${this._incrementClickCount}">→</arrow-button>
        </div>
      </div>
    `;
  }

  _incrementClickCount() {
    this.clickCount++;
  }
}

customElements.define('arrow-button', Arrow);
customElements.define('full-layout', FullLayout);
