import {html, css} from 'lit-element';
import {PageViewElement} from './page-view-element.js';

class ClassifierTrain extends PageViewElement {
  static get styles() {
    return [
      css`
        :host {
          display: block;
        }
        
        .bg-image {
          align-self: center;
          margin: auto;
          z-index: -1;
          width: 50%;
          height: 50%;
          overflow: auto;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
        }
        
       .train-desc {
          padding: 24px 16px 0;
          text-align: center;
        }
      `
    ];
  }

  render() {
    return html`
      <div>
        <img class="bg-image" src="images/automl-lead.svg" alt="background image">
        <div class="train-desc">You can train the model with new data soon...</div>
      </div>
    `;
  }
}

window.customElements.define('classifier-train', ClassifierTrain);
