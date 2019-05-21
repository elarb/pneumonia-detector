import { html, css } from 'lit-element';
import { PageViewElement } from './page-view-element.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

class ClassifierAbout extends PageViewElement {
  static get styles() {
    return [
      SharedStyles,
      css`
        p {
          text-align: center;
        }
      `
    ];
  }

  render() {
    return html`
      <section>
        <h2>Our Vision</h2>
        <p>At PupilFlow we work on automating tasks and augmenting human capabilities with the power of AI. 
          This (PoC) app helps radiologists detect cases of Pneumonia.</p>
      </section>
      <section>
        <h2>Features</h2>
        <p>TODO: Add list of features...</p>
      </section>
      <section>
        <h2>Authors</h2>
        <p> This app is developed by the <a target="_blank" rel="noopener" href="https://pupilflow.com">PupilFlow</a> team. 
      Want to learn more? Send us an email to <a href="mailto:info@pupilflow.com">info@pupilflow.com</a></p>
      </section>
    `;
  }
}

window.customElements.define('classifier-about', ClassifierAbout);
