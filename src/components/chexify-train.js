import {html, css} from 'lit-element';
import {PageViewElement} from './page-view-element.js';
import {SharedStyles} from "./shared-styles.js";

class ChexifyTrain extends PageViewElement {
  static get styles() {
    return [
      SharedStyles,
      css`
        :host {
          display: block;
        }
      `
    ];
  }

  render() {
    return html`
      <div class="page-desc"><b>Coming soon:</b> Improve the model by submitting annotated images!</div>
      <img class="bg-image" src="images/automl-lead.svg" alt="Train page background image">
    `;
  }
}

window.customElements.define('chexify-train', ChexifyTrain);
