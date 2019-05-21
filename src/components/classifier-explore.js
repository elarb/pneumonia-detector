import {html, css} from 'lit-element';
import {PageViewElement} from './page-view-element.js';
import {repeat} from 'lit-html/directives/repeat.js';
import {connect} from 'pwa-helpers/connect-mixin.js';

// TODO: Create prediction item for list
import './prediction-item.js';

import {store} from '../store.js';

import {fetchPredictions} from '../actions/predictions.js';
import {predictions, itemListSelector} from '../reducers/predictions.js';

store.addReducers({
  predictions
});

class ClassifierExplore extends connect(store)(PageViewElement) {
  static get styles() {
    return [
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
        width: 32%;
        padding: 8px;
      }
      
      .predictions-desc {
        padding: 24px 16px 0;
        text-align: center;
      }
      
       @media screen and (max-width: 1072px) {
          prediction-item {
            width: 48%;
        }
      }
      
      @media screen and (max-width: 400px) {
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
    return html`
        <div ?hidden="${this._showOffline}">
          <div class="predictions" ?hidden="${!this._model}">
              ${repeat(this._items, item => html`
                <prediction-item .item="${item}"></prediction-item>
              `)}
          </div>
          <div class="predictions-desc" ?hidden="${this._model}">You will find your prediction results here. Select which model to show predictions for.</div>
        </div>
        <!-- TODO: Show refresh button when _showOffline is true-->
    `;
  }

  static get properties() {
    return {
      _model: {type: String},
      _items: {type: Array},
      _showOffline: { type: Boolean }
    }
  }

  stateChanged(state) {
    this._model = state.predictions.model;
    this._items = itemListSelector(state);
    this._showOffline = (state.app.offline && state.predictions.failure) || !state.user.currentUser;
  }
}

window.customElements.define('classifier-explore', ClassifierExplore);

export {fetchPredictions}
