import {html, css} from 'lit-element';
import {PageViewElement} from './page-view-element.js';
import {repeat} from 'lit-html/directives/repeat.js';
import {connect} from 'pwa-helpers/connect-mixin.js';

import './prediction-item.js';
import {SharedStyles} from "./shared-styles.js";

import {store} from '../store.js';

import {fetchPredictions} from '../actions/predictions.js';
import {predictions, itemListSelector} from '../reducers/predictions.js';

store.addReducers({
  predictions
});

class ChexifyPredictions extends connect(store)(PageViewElement) {
  static get styles() {
    return [
      SharedStyles,
      css`
      :host {
        display: block;
      }
      
      .predictions {
        display: flex;
        justify-content: fex-start;
        flex-wrap: wrap;
        width: 90%;
        margin: 16px auto;
      }
      
      prediction-item  {
        width: 23%;
        padding: 8px;
      }
      
      /* 3 per row */
      @media screen and (max-width: 1372px) {
          prediction-item {
            width: 32%;
        }
      }
      
      /* 2 per row*/
      @media screen and (max-width: 1072px) {
          prediction-item {
            width: 48%;
        }
      }
      
      /* 1 per row */
      @media screen and (max-width: 448px) {
          .predictions {
            width: 90%;
          }
          prediction-item {
            width: 100%;
            margin: 0 0 8px 0;
          }
      }
      `
    ];
  }

  render() {
    const noItems = !this._items || this._items.length === 0;
    return html`
        <div class="page-desc" ?hidden="${!noItems}">You will find your prediction results here.</div>
        <img class="bg-image" ?hidden="${!noItems}" src="images/automl-lead.svg" alt="Predictions page background image">
        <div class="predictions" ?hidden="${noItems || this._showOffline}">
            ${repeat(this._items, item => html`
              <prediction-item .item="${item}"></prediction-item>
            `)}
        </div>
    `;
  }

  static get properties() {
    return {
      _items: {type: Array},
      _showOffline: {type: Boolean}
    }
  }

  stateChanged(state) {
    this._items = itemListSelector(state);
    this._showOffline = state.app.offline && state.predictions.failure;
  }
}

window.customElements.define('chexify-predictions', ChexifyPredictions);

export {fetchPredictions}
