import {html, css} from 'lit-element';
import {PageViewElement} from './page-view-element.js';

import {SharedStyles} from './shared-styles.js';

class ClassifierFeedback extends PageViewElement {
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
        <h2>Feedback</h2>
         <p> This app is developed by the <a target="_blank" rel="noopener" href="https://pupilflow.com">PupilFlow</a> team. 
         Want to learn more or send feedback? Email us at <a href="mailto:contact@pupilflow.com">info@pupilflow.com</a></p>
      </section>
      <section>
        <h2>About</h2>
        <p>At PupilFlow we work on automating tasks and augmenting human capabilities with the power of AI.</p>
                    
        <p>Pneumonia accounts for over 15% of all deaths of children under 5 years old internationally. 
        In 2015, 920,000 children under the age of 5 died from the disease. 
        In the United States, pneumonia accounts for over 500,000 visits to emergency departments and over 
        50,000 deaths in 2015, keeping the ailment on the list of top 10 causes of death in the country.</p>
        
        <p>While common, accurately diagnosing pneumonia is a tall order. It requires review of a chest radiograph (CXR) 
        by highly trained specialists and confirmation through clinical history, vital signs and laboratory exams. 
        Pneumonia usually manifests as an area or areas of increased opacity on CXR. However, the diagnosis of pneumonia 
        on CXR is complicated because of a number of other conditions in the lungs such as 
        fluid overload (pulmonary edema), bleeding, volume loss (atelectasis or collapse), lung cancer, 
        or post-radiation or surgical changes. Outside of the lungs, fluid in the pleural space (pleural effusion) also 
        appears as increased opacity on CXR. When available, comparison of CXRs of the patient taken at different time 
        points and correlation with clinical symptoms and history are helpful in making the diagnosis.</p>
        
        <p>With this app we want to help radiologists automate initial detection (imaging screening) of potential 
        pneumonia cases in order to prioritize and expedite their review.</p>
      </section>
    `;
  }
}

window.customElements.define('classifier-feedback', ClassifierFeedback);
