import logo from '../assets/pdoom-logo.png';

export const headerTemplate = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Lora:ital@0;1&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
distill-header {
  display: block !important;
  font-family: 'Lora', serif;
  font-style: normal;
  position: relative;
  height: 60px;
  background-color: #000;
  width: 100%;
  box-sizing: border-box;
  z-index: 2;
  color: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}
distill-header .content {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  max-width: 1080px;
  width: 100%;
  margin: 0 auto;
}
distill-header a {
  font-size: 16px;
  height: 60px;
  line-height: 60px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
}
distill-header a:hover {
  color: rgba(255, 255, 255, 1);
}
distill-header img {
  width: 48px;
  height: 48px;
  margin-right: 6px;
}
@media(min-width: 1080px) {
  distill-header { height: 70px; }
  distill-header .content { height: 70px; }
  distill-header a { height: 70px; line-height: 70px; }
}
distill-header .logo {
  display: flex;
  align-items: center;
  font-size: 30px;
  font-weight: 200;
  font-style: italic;
}
distill-header .nav {
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif;
}
distill-header .nav a {
  font-size: 12px;
  margin-left: 24px;
  text-transform: uppercase;
  font-style: normal;
  letter-spacing: 0.06em;
}
@media(max-width: 640px) {
  distill-header { height: auto; }
  distill-header .content {
    height: auto;
    padding: 8px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  distill-header a {
    height: auto;
    line-height: 1.3;
  }
  distill-header .logo {
    font-size: 24px;
    line-height: 1;
  }
  distill-header img {
    width: 36px;
    height: 36px;
  }
  distill-header .nav {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
  }
  distill-header .nav a {
    margin-left: 0;
    padding: 6px 0;
    font-size: 12px;
  }
}
</style>
<div class="content">
  <a href="/" class="logo">
    <img src="${logo}" alt="p(doom) logo" />
    p(doom)
  </a>
  <nav class="nav">
    <a href="blog.html">Research</a>
    <a href="about.html">About</a>
    <a href="https://discord.gg/G4JNuPX2VR">Join</a>
  </nav>
</div>
`;
