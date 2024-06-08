import logo from '../assets/pdoom-logo.png';

export const footerTemplate = `
<style>

:host {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
  padding: 2rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background-color: hsl(180, 5%, 15%); /*hsl(200, 60%, 15%);*/
  text-align: left;
  contain: content;
}

.footer-container .logo img {
  width: 24px;
  position: relative;
  top: 4px;
  margin-right: 2px;
}

.footer-container .logo {
  font-size: 17px;
  font-weight: 200;
  font-family: 'Lora', serif;
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin-right: 6px;
}

.footer-container {
  grid-column: text;
}

.footer-container .nav {
  font-size: 0.9em;
  margin-top: 1.5em;
}

.footer-container .nav a {
  color: rgba(255, 255, 255, 0.8);
  margin-right: 6px;
  text-decoration: none;
}

</style>

<div class='footer-container'>

  <a href="/" class="logo">
    <img src="${logo}" alt="p(doom) logo" />
    p(doom)
  </a> is dedicated to truly open research on the path to AGI

  <div class="nav">
    <a href="index.html">Archive</a>
    <a href="https://github.com/p-doom">GitHub</a>
    <a href="https://twitter.com/prob_doom">Twitter</a>
    <hr>
    We are thankful to distill.pub for creating the template on which we based this blog.
  </div>

</div>

`;
