import {html, css} from 'lit-element';
import {PageViewElement} from './page-view-element.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {repeat} from 'lit-html/directives/repeat.js';
import {store} from '../store.js';

import './classifier-image.js';
import '@polymer/paper-spinner/paper-spinner-lite.js'

import {fetchPrediction, removePrediction} from '../actions/prediction.js';
import {prediction, predictionSelector} from '../reducers/prediction.js';
import {MwcStyle} from "./mwc-style.js";
import {formatDate} from "../utils.js";
import {updateLocationURL} from "../actions/app";

store.addReducers({
  prediction
});

class ClassifierPrediction extends connect(store)(PageViewElement) {
  static get styles() {
    return [
      MwcStyle,
      css`
      :host {
        display: block;
      }
      
      .card-container {
        position: relative;
        height: 512px;
        width: 100%;
        max-width: 800px;
        margin: 16px auto;
      }
      
      [loading] {
        opacity: 0.25;
      }
      
      .spinner {
        position: absolute;
        height: 60px;
        width: 60px;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);
        z-index: 1;
      }
      
      .prediction-lists {
        margin: auto;
        font-size: 1em;
      }
      
      .prediction-list-item {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        width: 250px;
        padding: 4px 0;
        height: 32px;
        box-sizing: border-box;
      }
      
      .prediction-meter {
        display: inline-block;
        flex-basis: 100%;
        margin-top: 4px;
        height: 4px;
        background-color: #E0E0E0;
      }
      
      .prediction-meter-fill {
        display: inline-block;
        background-color: #0F9D58;
        height: 4px;
        vertical-align: top;
      }
      
      .prediction-text {
        font-size: 1.0em;
      }
      
      .prediction-score {
        flex-grow: 1;
        text-align: right;
      }
      
     .prediction-card {
        width: 100%
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
      
      .back-btn {
        margin: 4px;
      }
      
      [hidden] {
        display: none !important;
      }
      
      @media (max-width: 460px) {
        .container {
          width: 100%;
        }
      }
    `];
  }

  render() {
    if (!this._item) {
      return;
    }

    const item = this._item ? this._item : null;
    const id = item && item.id ? item.id : '';
    const date = (item && item.timestamp && (Number.isInteger(item.timestamp))) ? formatDate(item.timestamp) : '';

    const imageUrl = item ? item.imageUrl : '';
    const fileName = item ? item.fileName : '';

    const result = (item && item.result && item.result[0]) ? item.result : [];

    return html`
    <div class="card-container">
      <div class="mdc-card prediction-card" ?loading="${this._isFetching}">
        <div class="mdc-card__action-buttons">
            <a href="/predictions" class="mdc-button mdc-card__action back-btn">Back</a>
        </div>
        <div class="mdc-card__primary-action prediction-card__primary-action" tabindex="0">
          <div class="mdc-card__media mdc-card__media--16-9" style="background-image: url(&quot;${imageUrl}&quot;);"></div>
          <div class="prediction-card__primary">
            <h2 class="prediction-card__title mdc-typography mdc-typography--headline6">${id}</h2>
            <h3 class="prediction-card__subtitle mdc-typography mdc-typography--subtitle2">${date}</h3>
          </div>
          <div class="prediction-card__secondary mdc-typography mdc-typography--body2">
              <div class="prediction-lists" ?hidden="${this._isFetching}">
              ${repeat(result, item => {

      const classification = item.classification;
      const score = classification ? Math.round(item.classification.score * 100) : 0;
      const displayName = item.displayName ? item.displayName : '';

      return html`
                    <div class="prediction-list-item">
                      <div class="prediction-text">${displayName}</div>
                      <div class="prediction-score">${score}%</div>
                      <div class="prediction-meter">
                        <span class="prediction-meter-fill" style="width: ${score}%">
                        </span>
                      </div>
                    </div>
                  `
    })}
            </div>
          </div>
        </div>
        <div class="mdc-card__actions">
          <div class="mdc-card__action-buttons">
            <button class="mdc-button mdc-card__action mdc-card__action--button"
              @click="${() => console.log('generating pdf')}">Generate PDF</button>
          </div>
           <div class="mdc-card__action-buttons">
            <button class="mdc-button mdc-card__action mdc-card__action--button"
              @click="${() => this._remove(id)}">Remove</button>
          </div>
        </div>
      </div>
      <paper-spinner-lite class="spinner" ?active="${this._isFetching}"></paper-spinner-lite>
    </div>
    `;
  }

  static get properties() {
    return {
      _item: {type: Object},
      _isFetching: {type: Boolean}
    };
  }

  _remove(id) {
    store.dispatch(removePrediction(id));
    store.dispatch(updateLocationURL('/predictions'));
  }

  stateChanged(state) {
    this._item = predictionSelector(state);
    this._isFetching = state.prediction.isFetching;
  }
}

window.customElements.define('classifier-prediction', ClassifierPrediction);

export {fetchPrediction};
