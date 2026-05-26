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

import { Template } from '../mixins/template';

const T = Template('d-appendix', `
<style>

d-appendix {
  contain: layout style;
  font-family: var(--font-sans);
  font-size: 0.85em;
  line-height: 1.7em;
  margin-top: 60px;
  margin-bottom: 0;
  border-top: 1px solid var(--ash-300);
  color: var(--ash-700);
  padding-top: 60px;
  padding-bottom: 48px;
}

d-appendix h3 {
  grid-column: page-start / text-start;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-top: 1em;
  margin-bottom: 0;
  color: var(--ash-600);
}

d-appendix h3 + * {
  margin-top: 1em;
}

d-appendix ol {
  padding: 0 0 0 15px;
}

@media (min-width: 768px) {
  d-appendix ol {
    padding: 0 0 0 30px;
    margin-left: -30px;
  }
}

d-appendix li {
  margin-bottom: 1em;
}

d-appendix a {
  color: var(--ash-700);
  text-decoration: underline;
  text-decoration-color: var(--ash-400);
  text-underline-offset: 0.18em;
  transition: color 160ms cubic-bezier(0.2, 0, 0, 1),
              text-decoration-color 160ms cubic-bezier(0.2, 0, 0, 1);
}

d-appendix a:hover {
  color: var(--ember);
  text-decoration-color: var(--ember);
}

d-appendix > * {
  grid-column: text;
}

d-appendix > d-footnote-list,
d-appendix > d-citation-list,
d-appendix > distill-appendix {
  grid-column: screen;
}

</style>

`, false);

export class Appendix extends T(HTMLElement) {

}
