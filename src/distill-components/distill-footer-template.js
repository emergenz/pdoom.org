import logo from '../assets/pdoom-logo.png';

export const footerTemplate = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Lora:ital@1&display=swap');

:host {
  display: block;
  background: #fff;
  border-top: 1px solid #e5e5e5;
  padding: 20px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  contain: content;
}

.footer-container {
  grid-column: text;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-container .logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: color 0.15s ease;
}

.footer-container .logo:hover {
  color: rgba(0,0,0,0.8);
}

.footer-container .logo:hover span {
  color: rgba(0,0,0,0.8);
}

.footer-container .logo:hover img {
  opacity: 0.7;
}

.footer-container .logo img {
  transition: opacity 0.15s ease;
}

.footer-container .logo img {
  width: 24px;
  height: 24px;
  opacity: 0.35;
}

.footer-container .logo span {
  font-family: 'Lora', Georgia, serif;
  font-style: italic;
  font-size: 18px;
  color: rgba(0,0,0,0.4);
}

.footer-container .nav {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.footer-container .nav a {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(0,0,0,0.4);
  text-decoration: none;
  transition: color 0.15s ease;
}

.footer-container .nav a:hover {
  color: rgba(0,0,0,0.8);
}

@media(max-width: 640px) {
  .footer-container {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  .footer-container .nav {
    gap: 16px;
    justify-content: center;
  }
}
</style>

<div class='footer-container'>
  <a href="/" class="logo">
    <img src="${logo}" alt="" />
    <span>p(doom)</span>
  </a>
  <div class="nav">
    <a href="https://github.com/p-doom/">GitHub</a>
    <a href="https://discord.gg/G4JNuPX2VR">Discord</a>
    <a href="https://x.com/@prob_doom">Twitter</a>
    <a href="https://www.linkedin.com/company/p-doom">LinkedIn</a>
    <a href="https://huggingface.co/p-doom">HuggingFace</a>
  </div>
</div>
`;
