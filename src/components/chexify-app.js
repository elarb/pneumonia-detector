import {LitElement, html, css} from 'lit-element';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';
import {installOfflineWatcher} from 'pwa-helpers/network.js';
import {installRouter} from 'pwa-helpers/router.js';
import {updateMetadata} from 'pwa-helpers/metadata.js';

// This element is connected to the Redux store.
import {store} from '../store.js';
import user from "../reducers/user";
import {setUser, fetchStoredUser} from '../actions/user.js';

store.addReducers({
  user
});

// These are the actions needed by this element.
import {
  navigate,
  updateOffline,
  updateDrawerState
} from '../actions/app.js';

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';

import {menuIcon, logoutIcon} from './chexify-icons.js';
import './snack-bar.js';
import './chexify-warning-dialog.js'
import {toTitleCase} from "../utils.js";

class ChexifyApp extends connect(store)(LitElement) {
  static get properties() {
    return {
      appTitle: {type: String},
      _page: {type: String},
      _drawerOpened: {type: Boolean},
      _snackbarOpened: {type: Boolean},
      _offline: {type: Boolean},
      _user: {type: Object},
    };
  }

  static get styles() {
    return [
      css`
        :host {
          display: block;

          --app-drawer-width: 256px;

          --app-header-height: 64px;
          --app-footer-height: 104px;
          /* The 1px is to make the scrollbar appears all the time */
          --app-main-content-min-height: calc(100vh - var(--app-header-height) - var(--app-footer-height));

          --app-primary-color: #42a5f5;
          --app-secondary-color: #80d6ff;
          --app-dark-text-color: var(--app-secondary-color);
          --app-light-text-color: white;
          --app-section-even-color: #f7f7f7;
          --app-section-odd-color: white;

          --app-header-selected-color: var(--app-primary-color);

          --app-drawer-background-color: var(app-secondary-color);
          --app-drawer-text-color: black;
          --app-drawer-selected-color: var(app-primary-color);
        }

        app-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          text-align: center;
          background-color: var(--app-primary-color);
          color: white;
          z-index: 1;
          /* border-bottom: 1px solid #eee; */
        }

        .toolbar-top {
          background-color: var(--app-header-background-color);
          justify-content: space-between;
        }

        [main-title] > a {
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 0.1em;
          text-decoration: none;
          color: inherit;
          pointer-events: auto;
          /* required for IE 11, so this <a> can receive pointer events */
          display: inline-block;
        }
        
       .toolbar-list {
          display: none;
        }

        .toolbar-list > a {
          display: inline-block;
          color: var(--app-header-text-color);
          text-decoration: none;
          line-height: 30px;
          padding: 4px 24px;
        }

        .toolbar-list > a[selected] {
          border-bottom: 4px solid var(--app-secondary-color);
          font-weight: bold;
        }
        
        .logo {
          width: 112px;
          margin-top: 8px;
        }

        .menu-btn,
        .back-btn,
        .signout {
          display: inline-block;
          width: 44px;
          height: 44px;
          padding: 8px;
          box-sizing: border-box;
          background: none;
          border: none;
          fill: white;
          cursor: pointer;
          text-decoration: none;
        }
        
        .signout {
          padding: 2px;
        }
  
        .signout > img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
        }

        app-drawer {
          z-index: 2;
        }

        .drawer-list {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          padding: 24px;
          background: var(--app-drawer-background-color);
          position: relative;
          margin: auto;
        }

        .drawer-list > a {
          display: block;
          text-decoration: none;
          color: var(--app-drawer-text-color);
          line-height: 40px;
          padding: 0 24px;
        }

        .drawer-list > a[selected] {
          color: var(--app-drawer-selected-color);
          font-weight: bold;
        }

        /* Workaround for IE11 displaying <main> as inline */
        main {
          display: block;
        }

        .main-content {
          padding-top: var(--app-header-height);
          min-height: var(--app-main-content-min-height);
        }

        .page {
          display: none;
        }

        .page[active] {
          display: block;
        }

        footer {
          padding: 16px;
          background: var(--app-drawer-background-color);
          color: var(--app-drawer-text-color);
          text-align: center;
        }
        
        
        /* Wide layout: when the viewport width is bigger than 800px, layout
        changes to a wide layout */
        @media (min-width: 800px) {
          .toolbar-list {
            display: block;
            padding-right: 64px;
            margin: auto;
          }

          .menu-btn {
            display: none;
          }

          /* The drawer button isn't shown in the wide layout, so we don't
          need to offset the title */
          [main-title] {
            max-width: 128px;
            padding-left: 16px;
          }
        }
        
       [hidden] {
          display: none !important;
       }
      `
    ];
  }

  render() {
    return html`
      <!-- Header -->
      <app-header condenses reveals effects="waterfall">
        <app-toolbar class="toolbar-top">
          <button class="menu-btn" title="Menu" @click="${this._menuButtonClicked}">${menuIcon}</button>
          <div main-title><a href="/" aria-label="Go to home"><img class="logo" src="images/logo.svg" alt="Logo"></a></div>
          
          <!-- This gets hidden on a small screen-->
          <nav class="toolbar-list">
            <a ?selected="${this._page === 'predict'}" href="/predict">Predict</a>
            <a ?selected="${this._page === 'predictions'}" href="/predictions">Predictions</a>
            <a ?selected="${this._page === 'train'}" href="/train">Train</a>
            <a ?selected="${this._page === 'feedback'}" href="/feedback">Feedback</a>
          </nav>
          
          <button ?hidden="${!this._user}" class="signout" aria-label="Sign out" title="Sign out"
            @click="${() => this._user && this._signOut()}">${logoutIcon}</button>
        </app-toolbar>
        
      </app-header>

      <!-- Drawer content -->
      <app-drawer
          .opened="${this._drawerOpened}"
          @opened-changed="${this._drawerOpenedChanged}">
        <nav class="drawer-list">
          <a ?selected="${this._page === 'predict'}" href="/predict">Predict</a>
          <a ?selected="${this._page === 'predictions'}" href="/predictions">Predictions</a>
          <a ?selected="${this._page === 'train'}" href="/train">Train</a>
          <a ?selected="${this._page === 'feedback'}" href="/feedback">Feedback</a>
        </nav>
      </app-drawer>

      <!-- Main content -->
      <main role="main" class="main-content">
        <chexify-predict class="page" ?active="${this._page === 'predict'}"></chexify-predict>
        <chexify-prediction class="page" ?active="${this._page === 'prediction'}"></chexify-prediction>
        <chexify-predictions class="page" ?active="${this._page === 'predictions'}"></chexify-predictions>
        <chexify-train class="page" ?active="${this._page === 'train'}"></chexify-train>
        <chexify-feedback class="page" ?active="${this._page === 'feedback'}"></chexify-feedback>
        <chexify-view404 class="page" ?active="${this._page === 'view404'}"></chexify-view404>
      </main>

      <footer>
        <p>&copy ${new Date().getFullYear()} PupilFlow</p>
      </footer>
      
      <chexify-warning-dialog id="errorDialog"></chexify-warning-dialog>

      <snack-bar ?active="${this._snackbarOpened}">
        You are now ${this._offline ? 'offline' : 'online'}.
      </snack-bar>
    `;
  }

  constructor() {
    super();
    // To force all event listeners for gestures to be passive.
    // See https://www.polymer-project.org/3.0/docs/devguide/settings#setting-passive-touch-gestures
    setPassiveTouchGestures(true);

    this.addEventListener('error-dialog', e => this._handleError(e));
  }

  firstUpdated() {
    installRouter((location) => store.dispatch(navigate(location)));
    installOfflineWatcher((offline) => store.dispatch(updateOffline(offline)));
    installMediaQueryWatcher(`(min-width: 460px)`,
      () => store.dispatch(updateDrawerState(false)));

    // store.dispatch(fetchStoredUser());

    firebase.auth().onAuthStateChanged(user => {
      store.dispatch(setUser(user));
    });
  }

  updated(changedProps) {
    if (changedProps.has('_page')) {
      const pageTitle = toTitleCase(this._page) + ' - ' + this.appTitle;
      updateMetadata({
        title: pageTitle,
        description: pageTitle
        // This object also takes an image property, that points to an img src.
      });
    }
  }

  _menuButtonClicked() {
    store.dispatch(updateDrawerState(true));
  }

  _drawerOpenedChanged(e) {
    store.dispatch(updateDrawerState(e.target.opened));
  }

  _signOut() {
    firebase.auth().signOut().then(() => {
      window.location.assign('/');
    });
  }

  _handleError(e) {
    let errorDialog = this.shadowRoot.querySelector('#errorDialog');
    errorDialog._header = e.detail.header;
    errorDialog._text = e.detail.text;
    errorDialog.open();
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._offline = state.app.offline;
    this._snackbarOpened = state.app.snackbarOpened;
    this._drawerOpened = state.app.drawerOpened;
    this._user = state.user.currentUser;
  }
}

window.customElements.define('chexify-app', ChexifyApp);
