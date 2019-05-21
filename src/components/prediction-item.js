import {LitElement, html, css} from 'lit-element';

import './classifier-image.js';
import {MwcStyle} from "./mwc-style.js";
import {formatDate} from "../utils.js";

class PredictionItem extends LitElement {
  static get styles() {
    return [
      MwcStyle,
      css`
      :host {
        display: block;
      }
      
      .prediction-card {
        width: 100%;
      }
      
      .prediction-card__primary {
        padding: 1rem;
      }
      
      .prediction-card__secondary {
        padding: 0 1rem 8px;
      }
      
      .prediction-card__title, .prediction-card__subtitle {
        margin: 0;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;  
      }
      
      .prediction-card__subtitle {
        color: var(--mdc-theme-text-secondary-on-background,rgba(0,0,0,.54));
      }
      
      .confidence-score {
        width: 32px;
        height: 24px;
        position: absolute;
        bottom: 0;
        right: 0;
        margin: 4px;
        border-radius: 4px;
        text-align: center;
        color: #3c3c3c;
        font-weight: 600;
      }

      [hidden] {
        display: none !important;
      }
      `
    ];
  }

  render() {
    const item = this.item ? this.item : null;
    const id = item && item.id ? item.id : '';
    const date = (item && item.timestamp && (Number.isInteger(item.timestamp))) ? formatDate(item.timestamp) : '';

    const thumbnail = item ? item.thumbUrl : null;
    const fileName = item ? item.fileName : '';

    const result = (item && item.result && item.result[0]) ? item.result[0] : null;

    const hasScore = result && result.classification && result.classification.score;
    const score = hasScore ? Math.round(result.classification.score * 100) : 0;
    const displayName = result ? result.displayName.toLowerCase().replace(/(^\w|\s+\w)/g, str => str.toUpperCase()) : '';

    return html`
    <div class="mdc-card prediction-card">
      <div class="mdc-card__primary-action prediction-card__primary-action" tabindex="0">
        <div class="mdc-card__media mdc-card__media--16-9" style="background-image: url(&quot;${thumbnail}&quot;);"></div>
        <div class="prediction-card__primary">
          <h2 class="prediction-card__title mdc-typography mdc-typography--headline6">${id}</h2>
          <h3 class="prediction-card__subtitle mdc-typography mdc-typography--subtitle2">${date}</h3>
        </div>
        <div class="prediction-card__secondary mdc-typography mdc-typography--body2">Result: ${displayName}</div>
        <div class="confidence-score" style="background-color: ${[[PredictionItem._computeConfidenceColor(score)]]};" title="confidence score">${score}</div>
      </div>
      <div class="mdc-card__actions">
        <div class="mdc-card__action-buttons">
          <a href="/prediction/${id}" class="mdc-button mdc-card__action mdc-card__action--button">Show</a>
        </div>
      </div>
    </div>
    `;
  }

  static get properties() {
    return {
      item: {type: Object}
    }
  }

  // https://stackoverflow.com/a/17268489/7390720
  static _computeConfidenceColor(score) {
    if (!score) {
      return;
    }
    const hue = (score * 1.2).toString(10);
    return ['hsl(', hue, ',100%,50%)'].join('');
  }
}

window.customElements.define('prediction-item', PredictionItem);
