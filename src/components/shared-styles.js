/**
 @license
 Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {css} from 'lit-element';

export const SharedStyles = css`
  section {
    padding: 24px;
    background: var(--app-section-odd-color);
  }

  section > * {
    max-width: 600px;
    margin-right: auto;
    margin-left: auto;
  }

  section:nth-of-type(even) {
    background: var(--app-section-even-color);
  }

  h2 {
    font-size: 24px;
    text-align: center;
  }

  @media (min-width: 460px) {
    h2 {
      font-size: 28px;
    }
  }
  
  a {
    color: var(--app-primary-color);
    text-decoration: none;
  }
  
  .page-desc {
    padding: 24px 16px 0;
    text-align: center;
  }
  
  .bg-image {
    align-self: center;
    margin: auto;
    z-index: -1;
    width: 640px;
    overflow: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  
  @media screen and (max-width: 768px) {
    .bg-image {
      width: 90%;
    }
  }
  
  [hidden] {
    display: none !important;
    width: 0;
    height: 0;
    margin: 0;
  }
`;
