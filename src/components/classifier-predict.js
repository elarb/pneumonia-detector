import {css, html} from 'lit-element';
import {PageViewElement} from './page-view-element.js';
import {connect} from 'pwa-helpers/connect-mixin.js';

import '@vaadin/vaadin-upload/vaadin-upload.js';
import './classifier-image.js';
import {uuid4} from "../utils.js";
// This element is connected to the Redux store.
import {store} from '../store.js';
import {prediction} from '../reducers/prediction.js';
import {updateLocationURL} from "../actions/app.js";
import {listenPrediction} from "../actions/prediction.js";

store.addReducers({prediction});

class ClassifierPredict extends connect(store)(PageViewElement) {
  static get properties() {
    return {
      _page: {type: String},
      _user: {type: Object},
    };
  }

  static get styles() {
    return [
      css`
      :host {
        display: block;
      }

      .classifier-bg {
        height: 300px;
        max-width: 570px;
        margin: 16px auto;
      }

      .classifier-desc, .sign-in-text, .img-req {
        text-align: center;
      }
      
      .img-req {
        font-style: italic;
      }
      
      vaadin-upload {
        width: 768px;
        max-width: 100%;
        height: 272px;
        margin: 16px auto;
        background: #f5f5f5;
      }
      
      .upload-field {
        display: block;
      }
      
      [hidden] {
        display: none;
      }

      @media (max-width: 460px) {
        :host {
          margin: 8px;
        }
        .classifier-bg {
          height: 200px;
          margin: 8px auto;
        }

        vaadin-upload {
          height: 180px;
          width: 100%;
        }
      }
      `
    ];
  }

  render() {
    return html`
      <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/4.0.0/firebaseui.css" />
      <classifier-image class="classifier-bg" alt="Pneumonia Detector Image" center src="images/xray-bg.jpg" placeholder=""></classifier-image>
      <div class="classifier-desc">Detect cases of Pneumonia by uploading chest X-ray images.</div>
      <div class="upload-field" ?hidden="${!this._user}">
        <p class="img-req">Maximum file size is 1.5MB. Supported formats: JPEG, PNG, GIF</p>
        <vaadin-upload id="upload" max-files="1" accept="image/jpeg, image/png, image/gif" max-file-size="1500000">
        </vaadin-upload>
      </div>
      <div id="firebaseui-auth-container" ?hidden="${this._user}"></div>
    `;
  }

  firstUpdated() {
    this._initFirebaseUI();

    this.vaadinUpload = this.shadowRoot.querySelector('vaadin-upload#upload');

    this.vaadinUpload.set('i18n.addFiles', {
      one: 'Select image...',
      many: 'Select images...'
    });

    this.vaadinUpload.addEventListener('file-reject', (e) => {
      this._showErrorDialog('File rejected', e.detail.error);
      // store.dispatch(showErrorDialog({header: 'File Rejected', text: e.detail.error}));
    });

    this.vaadinUpload.addEventListener('upload-before', (e) => {
      e.preventDefault();
      this._uploadFile(e.detail.file);
    });
  }

  _uploadFile(file) {
    // const localImageUrl = window.URL.createObjectURL(file);
    const storage = firebase.storage();
    const storageRef = storage.ref();

    const predId = uuid4();

    const path = `user/uploads/${this._user.uid}/pneumonia/${predId}/${file.name}`;

    let imgRef = storageRef.child(path);
    let uploadTask = imgRef.put(file);

    uploadTask.then(() => {
      store.dispatch(listenPrediction(predId));
    });

    uploadTask.on('state_changed', snapshot => {
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      file.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      this.vaadinUpload._notifyFileChanges(file);

      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          file.status = 'Paused';
          this.vaadinUpload._notifyFileChanges(file);
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          file.status = 'Running';
          this.vaadinUpload._notifyFileChanges(file);
          break;
      }
    }, error => {
      // Handle unsuccessful uploads
      file.status = 'Failed';
      this.vaadinUpload._notifyFileChanges(file);

    }, () => {
      file.status = 'Completed';
      file.complete = true;
      this.vaadinUpload._notifyFileChanges(file);
      store.dispatch(updateLocationURL(`/prediction/${predId}`));
      // Clear the fi;es
      this.vaadinUpload.files = [];
    });
  }

  _showErrorDialog(header, text) {
    this.dispatchEvent(new CustomEvent('error-dialog', {
      detail: {header, text},
      bubbles: true,
      composed: true,
    }));
  }

  stateChanged(state) {
    this._page = state.app.page;
    this._user = state.user.currentUser;
  }

  _initFirebaseUI() {
    // FirebaseUI config.
    const uiConfig = {
      signInSuccessUrl: '/',
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
      ],
      // tosUrl and privacyPolicyUrl accept either url string or a callback function.
      // Terms of service url/callback.
      tosUrl: 'pneumonia.wep.app/tos',
      // Privacy policy url/callback.
      privacyPolicyUrl: () => {
        window.location.assign('pneumonia.wep.app/privacy');
      }
    };

    // Initialize the FirebaseUI Widget using Firebase.
    let ui = new firebaseui.auth.AuthUI(firebase.auth());
    // The start method will wait until the DOM is loaded.
    ui.start(this.shadowRoot.querySelector('#firebaseui-auth-container'), uiConfig);
  }
}

window.customElements.define('classifier-predict', ClassifierPredict);
