import {html, css} from 'lit-element';
import {PageViewElement} from './page-view-element.js';

import {SharedStyles} from './shared-styles.js';

class ClassifierFeedback extends PageViewElement {
  static get styles() {
    return [
      SharedStyles,
      css`
      :host {
        display: block;
        box-sizing: border-box;
      }
      `
    ];
  }

  render() {
    return html`
      <section>
        <h2>Feedback</h2>
         <p> This app is developed by <a target="_blank" rel="noopener" href="https://pupilflow.com">PupilFlow</a>. 
         Want to learn more or send feedback? Email me at <a target="_blank" rel="noopener" href='&#109;&#97;&#105;lto&#58;elias&#64;p%75%7&#48;il%6&#54;&#108;o%7&#55;%2E&#37;63o&#37;6&#68;'>el&#105;as&#64;pupilfl&#111;w&#46;com</a></p>
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
        
        <p>This app uses state-of-the-art AI to automate initial detection (imaging screening) of potential 
        pneumonia cases, enabling radiologists to prioritize and expedite their review.</p>
      </section>
    `;
  }
}

window.customElements.define('classifier-feedback', ClassifierFeedback);
