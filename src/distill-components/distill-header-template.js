import logo from '../assets/pdoom-logo.png';

export const headerTemplate = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@1,400&display=swap');

body {
  padding-top: 70px;
}

distill-header {
  display: block !important;
  grid-template-columns: none !important;
  grid-column-gap: 0 !important;
  padding: 0 !important;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #000;
  z-index: 200;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
}

distill-header * {
  box-sizing: border-box;
}

distill-header .content {
  max-width: 1120px;
  margin: 0 auto;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
}

distill-header a {
  text-decoration: none;
  color: rgba(255,255,255,0.8);
  transition: color 0.15s ease;
  font-weight: inherit;
}

distill-header .logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

distill-header .logo img {
  width: 52px;
  height: 52px;
}

distill-header .logo span {
  font-family: 'Lora', Georgia, serif;
  font-style: italic;
  font-size: 28px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  line-height: 1;
}

distill-header .nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

distill-header .nav a {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.8);
  height: auto;
  line-height: 1;
}

distill-header .nav a:hover {
  color: rgba(255,255,255,1);
}

@media(max-width: 600px) {
  distill-header .content {
    padding: 0 20px;
  }
  distill-header .nav { gap: 16px; }
  distill-header .nav a { font-size: 11px; letter-spacing: 0.04em; }
  distill-header .logo span { font-size: 22px; }
  distill-header .logo img { width: 36px; height: 36px; }
  distill-header a { height: auto; line-height: 1; }
}

@media(max-width: 480px) {
  distill-header { height: auto; }
  distill-header .content {
    height: auto;
    padding: 20px 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  body { padding-top: 0; }
}
</style>
<div class="content">
  <a href="/" class="logo">
    <img src="${logo}" alt="p(doom)" />
    <span>p(doom)</span>
  </a>
  <nav class="nav">
    <a href="/blog.html">Research</a>
    <a href="/about.html">About</a>
    <a href="https://discord.gg/G4JNuPX2VR">Join</a>
  </nav>
</div>
`;
