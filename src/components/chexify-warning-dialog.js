import {LitElement, html, css} from "lit-element";
import '@polymer/paper-dialog/paper-dialog.js';

class ChexifyWarningDialog extends LitElement {
  static get properties() {
    return {
      _header: {type: String},
      _text: {type: String}
    }
  }

  static get styles() {
    return [
      css`
      :host {
				display: block;
			}

			paper-dialog {
				border: 2px solid #F2DEDE;
				background-color: #f1f8e9;
				color: #8D3636;
				width: 700px;
				height: 300px;
			}

			@media (max-width: 700px) {
				paper-dialog {
					width: 350px;
					height: 200px;
				}
			}
      `
    ];
  }

  render() {
    return html`
    <paper-dialog id="dialog">
			<h1>${this._header}</h1>
			<p>${this._text}</p>
		</paper-dialog>
    `;
  }

  open() {
    this.shadowRoot.querySelector('#dialog').open();
  }
}

customElements.define('chexify-warning-dialog', ChexifyWarningDialog);
