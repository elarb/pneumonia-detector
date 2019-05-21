import {html, css} from 'lit-element';
import {PageViewElement} from './page-view-element.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {repeat} from 'lit-html/directives/repeat.js';
import {store} from '../store.js';

import './classifier-image.js';
import '@polymer/paper-spinner/paper-spinner-lite.js'

import {fetchPrediction} from '../actions/prediction.js';
import {prediction, predictionSelector} from '../reducers/prediction.js';

// We are lazy loading its reducer.
store.addReducers({
  prediction
});

class ClassifierPrediction extends connect(store)(PageViewElement) {
  static get styles() {
    return [css`
      :host {
        display: block;
      }
      
      .container {
        display: flex;
        width: 70vw;
        margin: 16px auto;
        flex-wrap: wrap;
        justify-content: center;
        flex-direction: column;
        
        color: #616161;
        
        flex-direction: column;
        box-sizing: border-box;
      }
      
      .image-container {
        position: relative;
        height: 512px;
        width: 100%;
        max-width: 800px;
        margin: auto;
      }
      
      classifier-image {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
      
      classifier-image[loading] {
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
      
      .image-name {
        font-size: .8em;
        font-weight: bold;
        overflow: hidden;
        padding-top: 4px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .prediction-lists {
        margin: 16px auto;
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
    const isFetching = item ? item.isFetching : false;
    const imageUrl = item ? item.imageUrl : '';
    const imageName = item ? item.fileName : '';
    const result = (item && item.result) ? item.result : [];

    return html`
    <div class="container">
      <div class="image-container">
        <classifier-image class="image" alt="Prediction image" center src="${imageUrl}" placeholder="" ?loading="${isFetching}"></classifier-image>
        <paper-spinner-lite class="spinner" ?active="${isFetching}"></paper-spinner-lite>
      </div>
      <div class="image-name">${imageName}</div>
      <div class="prediction-lists" ?hidden="${isFetching}">
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
    `;
  }

  static get properties() {
    return {
      _item: {type: Object},
    };
  }

  stateChanged(state) {
    this._item = predictionSelector(state);
  }
}

window.customElements.define('classifier-prediction', ClassifierPrediction);

export {fetchPrediction};
