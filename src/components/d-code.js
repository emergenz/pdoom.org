// Copyright 2018 The Distill Template Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-julia';
import css from 'prismjs/themes/prism.css';

import { Template } from '../mixins/template.js';
import { Mutating } from '../mixins/mutating.js';

const T = Template('d-code', `
<style>

code {
  white-space: nowrap;
  font-family: var(--font-mono);
  background: var(--ash-100);
  border-radius: 0;
  padding: 2px 6px;
  font-size: 14px;
  color: var(--ash-700);
}

pre code {
  display: block;
  background: var(--ash-100);
  border-left: 1px solid var(--ash-400);
  padding: 12px 0 12px 24px;
}

${css}
</style>

<code id="code-container"></code>

`);

export class Code extends Mutating(T(HTMLElement)) {

  renderContent() {

    // check if language can be highlighted
    this.languageName = this.getAttribute('language');
    if (!this.languageName) {
      console.warn('You need to provide a language attribute to your <d-code> block to let us know how to highlight your code; e.g.:\n <d-code language="python">zeros = np.zeros(shape)</d-code>.');
      return;
    }
    const language = Prism.languages[this.languageName];
    if (language == undefined) {
      console.warn(`Distill does not yet support highlighting your code block in "${this.languageName}'.`);
      return;
    }

    let content = this.textContent;
    const codeTag = this.shadowRoot.querySelector('#code-container');

    if (this.hasAttribute('block')) {
      // normalize the tab indents
      content = content.replace(/\n/, '');
      const tabs = content.match(/\s*/);
      content = content.replace(new RegExp('\n' + tabs, 'g'), '\n');
      content = content.trim();
      // wrap code block in pre tag if needed
      if (codeTag.parentNode instanceof ShadowRoot) {
        const preTag = document.createElement('pre');
        this.shadowRoot.removeChild(codeTag);
        preTag.appendChild(codeTag);
        this.shadowRoot.appendChild(preTag);
      }

    }

    codeTag.className = `language-${this.languageName}`;
    codeTag.innerHTML = Prism.highlight(content, language);
  }

}
