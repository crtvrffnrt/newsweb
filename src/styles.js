export const styles = `
:root {
  color-scheme:dark;
  --bg:#030408;
  --panel:#07090d;
  --panel-soft:#0a0d12;
  --text:#effff7;
  --muted:#7f9189;
  --green:#5cffb0;
  --cyan:#32e6ff;
  --magenta:#ff3fd2;
  --amber:#ffc857;
  --red:#ff4d6d;
  --violet:#9867ff;
  --line:rgb(92 255 176 / 14%);
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
* { box-sizing:border-box; }
html { background:var(--bg); }
body {
  min-height:100vh;
  margin:0;
  color:var(--text);
  background:
    radial-gradient(circle at 12% 2%,rgb(255 63 210 / 9%),transparent 29rem),
    radial-gradient(circle at 88% 7%,rgb(50 230 255 / 9%),transparent 34rem),
    radial-gradient(circle at 50% 100%,rgb(92 255 176 / 5%),transparent 32rem),
    linear-gradient(180deg,#06070c 0%,#030408 100%);
  font:400 16px/1.6 Inter,-apple-system,BlinkMacSystemFont,sans-serif;
  overflow-x:hidden;
}
body::before {
  content:"";
  position:fixed;
  inset:0;
  z-index:-1;
  pointer-events:none;
  opacity:.42;
  background:
    linear-gradient(116deg,transparent 0 31%,rgb(255 63 210 / 7%) 31.1% 31.25%,transparent 31.4%),
    linear-gradient(62deg,transparent 0 68%,rgb(50 230 255 / 6%) 68.1% 68.25%,transparent 68.4%),
    repeating-linear-gradient(0deg,transparent 0 3px,rgb(255 255 255 / 1.5%) 3px 4px);
}
a { color:inherit; }

nav {
  position:sticky;
  top:0;
  z-index:20;
  padding:16px 0;
  border-bottom:1px solid rgb(92 255 176 / 10%);
  background:rgb(3 4 8 / 86%);
  backdrop-filter:blur(18px);
}
.nav-content {
  display:flex;
  width:min(1380px,calc(100% - 48px));
  margin:auto;
  align-items:center;
  justify-content:space-between;
  gap:18px;
}
.nav-brand {
  color:#dfffee;
  font:800 .88rem/1.2 var(--mono);
  letter-spacing:.08em;
  text-decoration:none;
  text-transform:uppercase;
  text-shadow:0 0 16px rgb(92 255 176 / 16%);
}
.nav-brand::before { content:"patrick@news:~$ "; color:var(--green); }
.nav-actions { display:flex; align-items:center; gap:10px; }
.nav-icon-link {
  width:34px;
  height:34px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border:1px solid rgb(92 255 176 / 14%);
  border-radius:5px;
  background:rgb(8 11 15 / 78%);
  transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease;
}
.nav-icon-link:hover,.nav-icon-link:focus-visible {
  outline:0;
  transform:translateY(-1px);
  border-color:var(--green);
  box-shadow:0 0 18px rgb(92 255 176 / 10%);
}
.nav-icon-link img { display:block; max-width:18px; max-height:18px; }
.projects-menu { position:relative; }
.projects-menu summary { list-style:none; cursor:pointer; }
.projects-menu summary::-webkit-details-marker { display:none; }
.projects-icon { position:relative; }
.projects-icon::before { content:""; width:17px; height:12px; border:2px solid #fff; border-radius:3px; display:block; }
.projects-icon::after { content:""; position:absolute; width:21px; height:5px; left:50%; bottom:6px; transform:translateX(-50%); background:#fff; border-radius:2px; }
.projects-menu[open] .projects-icon { border-color:var(--magenta); box-shadow:0 0 20px rgb(255 63 210 / 16%); }
.projects-menu-panel {
  position:absolute;
  top:calc(100% + 12px);
  right:0;
  width:min(88vw,390px);
  max-height:min(72vh,560px);
  overflow-y:auto;
  padding:10px;
  border:1px solid rgb(50 230 255 / 22%);
  border-radius:7px;
  background:rgb(6 8 12 / 97%);
  box-shadow:0 26px 70px rgb(0 0 0 / 62%),0 0 34px rgb(50 230 255 / 7%);
}
.projects-menu-title { display:block; padding:6px 8px 10px; color:var(--cyan); font:700 .68rem/1.5 var(--mono); letter-spacing:.12em; text-transform:uppercase; }
.project-link { display:flex; align-items:center; justify-content:space-between; min-height:40px; padding:9px 10px; border:1px solid transparent; border-radius:5px; color:#eafff5; font-size:.82rem; font-weight:600; text-decoration:none; }
.project-link::after { content:"↗"; color:#5e7168; font:700 .7rem/1 var(--mono); }
.project-link:hover,.project-link:focus-visible { border-color:rgb(92 255 176 / 20%); outline:0; background:rgb(92 255 176 / 5%); }

main { width:min(1380px,calc(100% - 48px)); min-height:calc(100vh - 68px); margin:auto; padding:30px 0 42px; }
.terminal {
  overflow:hidden;
  border:1px solid rgb(50 230 255 / 14%);
  border-radius:7px;
  background:rgb(5 7 10 / 76%);
  box-shadow:0 22px 80px rgb(0 0 0 / 45%),0 0 34px rgb(50 230 255 / 5%),0 0 50px rgb(255 63 210 / 3%);
  font-family:var(--mono);
}
.terminal-header {
  min-height:42px;
  display:flex;
  align-items:flex-end;
  gap:13px;
  padding:0 12px;
  border-bottom:1px solid rgb(50 230 255 / 12%);
  background:linear-gradient(180deg,rgb(14 17 22 / 94%),rgb(8 10 14 / 92%));
  color:#617069;
  user-select:none;
}
.window-lights { display:flex; gap:7px; padding-bottom:14px; }
.window-lights i { width:8px; height:8px; border-radius:50%; background:var(--red); }
.window-lights i:nth-child(2) { background:var(--amber); }
.window-lights i:nth-child(3) { background:var(--green); }
.tab-strip { align-self:stretch; display:flex; min-width:0; flex:1; overflow-x:auto; gap:4px; align-items:flex-end; scrollbar-width:none; }
.tab-strip::-webkit-scrollbar { display:none; }
.terminal-tab {
  flex:none;
  height:34px;
  padding:0 14px;
  border:0;
  border-bottom:2px solid transparent;
  background:transparent;
  color:#6f8179;
  cursor:pointer;
  font:600 .72rem/1 var(--mono);
  letter-spacing:.02em;
}
.terminal-tab:hover,.terminal-tab:focus-visible { outline:0; color:#d9fff0; }
.terminal-tab.active,.terminal-tab[aria-selected="true"] { color:var(--green); border-bottom-color:var(--green); text-shadow:0 0 12px rgb(92 255 176 / 32%); }
.terminal-title { flex:none; align-self:center; color:#52615a; font:600 .68rem/1 var(--mono); }
.terminal-body { padding:20px clamp(16px,2.6vw,30px) 8px; }
.prompt { margin:0; padding:0 0 17px; border-bottom:1px solid rgb(92 255 176 / 11%); color:#7f9189; font:500 clamp(.73rem,1.1vw,.88rem)/1.4 var(--mono); }
.prompt-user { color:var(--green); font-weight:800; text-shadow:0 0 12px rgb(92 255 176 / 22%); }
.prompt b { color:var(--violet); font-weight:700; }
.prompt-command { color:#eafff5; }
.cursor { display:inline-block; width:7px; height:1.05em; margin-left:6px; vertical-align:-.15em; background:var(--green); box-shadow:0 0 12px rgb(92 255 176 / 55%); animation:cursor-blink 1.05s steps(1) infinite; }
@keyframes cursor-blink { 50% { opacity:.08; } }

.stream-list { display:block; }
.news-entry {
  position:relative;
  display:grid;
  grid-template-columns:112px minmax(0,1fr);
  gap:24px;
  padding:27px 5px;
  border-bottom:1px solid rgb(255 255 255 / 5.5%);
  transition:background .16s ease,padding-left .16s ease,border-color .16s ease;
}
.news-entry::before { content:""; position:absolute; left:-30px; top:0; bottom:0; width:2px; background:transparent; transition:background .16s ease,box-shadow .16s ease; }
.news-entry:hover { padding-left:12px; background:linear-gradient(90deg,rgb(92 255 176 / 3.5%),transparent 76%); border-color:rgb(92 255 176 / 10%); }
.news-entry:hover::before { background:var(--green); box-shadow:0 0 13px rgb(92 255 176 / 50%); }
.stream-date { padding-top:4px; color:#5f7068; white-space:nowrap; font:600 .66rem/1.4 var(--mono); letter-spacing:.04em; text-transform:uppercase; }
.stream-content { min-width:0; }
.entry-meta { display:flex; align-items:center; flex-wrap:wrap; gap:7px 11px; color:#73847c; font:700 .63rem/1.35 var(--mono); letter-spacing:.07em; text-transform:uppercase; }
.meta-severity { display:inline-flex; align-items:center; gap:6px; }
.meta-severity i { width:6px; height:6px; border-radius:50%; background:#73847c; box-shadow:0 0 10px currentColor; }
.severity-critical .meta-severity { color:var(--red); }
.severity-critical .meta-severity i { background:var(--red); }
.severity-high .meta-severity { color:var(--amber); }
.severity-high .meta-severity i { background:var(--amber); }
.severity-medium .meta-severity { color:var(--cyan); }
.severity-medium .meta-severity i { background:var(--cyan); }
.meta-category { color:var(--magenta); }
.meta-cve { color:var(--cyan); }
.meta-source { color:#aabbb4; }
.headline { margin:8px 0 9px; font:800 clamp(1.08rem,1.65vw,1.52rem)/1.18 Inter,-apple-system,BlinkMacSystemFont,sans-serif; letter-spacing:-.022em; }
.headline a { display:inline; text-decoration:none; color:#effff7; }
.headline a span { margin-left:.35em; color:var(--cyan); font:500 .72em/1 var(--mono); opacity:.68; }
.headline a:hover,.headline a:focus-visible { outline:0; color:#fff; text-shadow:0 0 18px rgb(92 255 176 / 9%); }
.headline a:hover span,.headline a:focus-visible span { color:var(--green); opacity:1; }
.entry-summary { max-width:1020px; margin:0; color:#9cadA6; font:400 .81rem/1.6 Inter,-apple-system,BlinkMacSystemFont,sans-serif; }
.news-expand-toggle {
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:9px;
  margin:4px 0 10px;
  padding:16px;
  border:0;
  border-top:1px solid rgb(92 255 176 / 9%);
  background:transparent;
  color:#769087;
  cursor:pointer;
  font:700 .68rem/1 var(--mono);
  letter-spacing:.1em;
  text-transform:uppercase;
}
.news-expand-toggle:hover,.news-expand-toggle:focus-visible { outline:0; color:var(--green); text-shadow:0 0 12px rgb(92 255 176 / 24%); }
.news-expand-toggle b { font-size:.9rem; }

@keyframes entry-arrival {
  0%,100% { background:transparent; }
  50% { background:linear-gradient(90deg,rgb(92 255 176 / 7%),rgb(50 230 255 / 2%),transparent 76%); box-shadow:inset 2px 0 0 var(--green); }
}
.new-entry-glow { animation:entry-arrival .55s ease-out 3; }

@media (max-width:760px) {
  nav { padding:12px 0; }
  .nav-content { width:calc(100% - 24px); }
  .nav-brand { max-width:calc(100% - 126px); font-size:.66rem; line-height:1.25; }
  .nav-brand::before { content:"news:~$ "; }
  .nav-actions { gap:7px; }
  .nav-icon-link { width:38px; height:38px; }
  .projects-menu-panel { position:fixed; top:61px; left:12px; right:12px; width:auto; max-height:calc(100vh - 78px); }
  main { width:calc(100% - 22px); padding:12px 0 24px; }
  .terminal-header { padding:0 9px; gap:8px; }
  .window-lights { display:none; }
  .terminal-title { display:none; }
  .terminal-tab { height:36px; padding:0 11px; font-size:.66rem; }
  .terminal-body { padding:15px 13px 4px; }
  .prompt { padding-bottom:14px; }
  .news-entry { grid-template-columns:1fr; gap:7px; padding:22px 2px; }
  .news-entry:hover { padding-left:6px; }
  .news-entry::before { left:-13px; }
  .stream-date { padding:0; }
  .entry-meta { gap:6px 9px; font-size:.58rem; }
  .headline { margin:8px 0 9px; font-size:1.18rem; line-height:1.2; }
  .entry-summary { font-size:.79rem; line-height:1.56; }
}


@media (max-width:1080px) and (min-width:761px) {
  main { width:min(100% - 32px,1180px); padding-top:22px; }
  .nav-content { width:min(100% - 32px,1180px); }
  .news-entry { grid-template-columns:96px minmax(0,1fr); gap:20px; padding:23px 4px; }
  .headline { font-size:1.28rem; }
  .entry-summary { font-size:.8rem; }
}

@media (max-width:760px) {
  html { background:#05060a; }
  body {
    min-height:100dvh;
    padding-bottom:env(safe-area-inset-bottom);
    background:
      radial-gradient(circle at 100% 0,rgb(50 230 255 / 7%),transparent 21rem),
      radial-gradient(circle at 0 16%,rgb(255 63 210 / 6%),transparent 18rem),
      #05060a;
  }
  body::before { opacity:.22; }

  nav {
    min-height:58px;
    padding:calc(8px + env(safe-area-inset-top)) 0 8px;
    border-bottom:1px solid rgb(255 255 255 / 6%);
    background:rgb(5 6 10 / 94%);
    box-shadow:0 8px 28px rgb(0 0 0 / 24%);
  }
  .nav-content {
    width:100%;
    min-height:40px;
    padding:0 12px;
    gap:10px;
  }
  .nav-brand {
    min-width:0;
    max-width:none;
    flex:1;
    overflow:hidden;
    font-size:0;
    white-space:nowrap;
  }
  .nav-brand::before {
    content:"PBI // NEWS";
    color:#effff7;
    font:800 .78rem/1 var(--mono);
    letter-spacing:.08em;
  }
  .nav-brand::after {
    content:"  live";
    color:var(--green);
    font:700 .6rem/1 var(--mono);
    letter-spacing:.04em;
    text-shadow:0 0 10px rgb(92 255 176 / 28%);
  }
  .nav-actions { flex:none; gap:6px; }
  .nav-icon-link {
    width:36px;
    height:36px;
    border-radius:10px;
    background:rgb(13 16 21 / 88%);
  }
  .projects-menu-panel {
    top:calc(58px + env(safe-area-inset-top));
    left:10px;
    right:10px;
    max-height:calc(100dvh - 78px - env(safe-area-inset-top));
    border-radius:14px;
  }

  main {
    width:100%;
    min-height:0;
    padding:0 0 calc(18px + env(safe-area-inset-bottom));
  }
  .terminal {
    overflow:visible;
    border:0;
    border-radius:0;
    background:transparent;
    box-shadow:none;
  }
  .terminal-header {
    position:sticky;
    top:calc(56px + env(safe-area-inset-top));
    z-index:14;
    min-height:49px;
    align-items:center;
    padding:7px 10px 0;
    border-bottom:1px solid rgb(255 255 255 / 7%);
    background:linear-gradient(180deg,rgb(5 6 10 / 98%),rgb(5 6 10 / 94%));
    backdrop-filter:blur(18px);
    box-shadow:0 8px 24px rgb(0 0 0 / 16%);
  }
  .window-lights,.terminal-title { display:none; }
  .tab-strip {
    align-self:stretch;
    align-items:center;
    gap:7px;
    padding-bottom:7px;
    scroll-snap-type:x proximity;
  }
  .terminal-tab {
    height:32px;
    padding:0 12px;
    border:1px solid rgb(255 255 255 / 8%);
    border-radius:999px;
    background:rgb(13 16 21 / 86%);
    color:#87988f;
    font-size:.62rem;
    scroll-snap-align:start;
  }
  .terminal-tab.active,.terminal-tab[aria-selected="true"] {
    border-color:rgb(92 255 176 / 36%);
    background:rgb(92 255 176 / 9%);
    color:var(--green);
    box-shadow:0 0 14px rgb(92 255 176 / 7%),inset 0 0 0 1px rgb(92 255 176 / 5%);
    text-shadow:none;
  }

  .terminal-body { padding:10px 10px 2px; }
  .prompt { display:none; }
  .stream-list { display:grid; gap:10px; }
  .news-entry {
    display:block;
    margin:0;
    padding:15px 15px 16px;
    border:1px solid rgb(255 255 255 / 7%);
    border-radius:14px;
    background:
      linear-gradient(145deg,rgb(12 15 20 / 96%),rgb(7 9 13 / 94%));
    box-shadow:0 10px 28px rgb(0 0 0 / 20%),inset 0 1px rgb(255 255 255 / 2.5%);
    transition:border-color .16s ease,transform .16s ease,background .16s ease;
  }
  .news-entry::before {
    left:0;
    top:13px;
    bottom:13px;
    width:2px;
    border-radius:0 2px 2px 0;
    background:rgb(92 255 176 / 18%);
  }
  .news-entry:hover {
    padding-left:15px;
    transform:none;
    border-color:rgb(92 255 176 / 18%);
    background:linear-gradient(145deg,rgb(13 17 21 / 98%),rgb(7 10 13 / 96%));
  }
  .news-entry:hover::before {
    background:var(--green);
    box-shadow:0 0 10px rgb(92 255 176 / 38%);
  }
  .stream-date {
    display:block;
    margin:0 0 8px 9px;
    padding:0;
    color:#718078;
    font-size:.58rem;
    letter-spacing:.05em;
  }
  .stream-content { min-width:0; }
  .entry-meta {
    gap:5px 8px;
    margin-left:9px;
    color:#7c8c84;
    font-size:.54rem;
    letter-spacing:.045em;
  }
  .meta-severity i { width:5px; height:5px; }
  .meta-source {
    max-width:44vw;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .headline {
    margin:8px 0 8px 9px;
    font-size:1.03rem;
    line-height:1.22;
    letter-spacing:-.018em;
  }
  .headline a { display:block; }
  .headline a span { font-size:.64em; }
  .entry-summary {
    display:-webkit-box;
    max-width:none;
    margin-left:9px;
    overflow:hidden;
    color:#a7b6af;
    font-size:.76rem;
    line-height:1.5;
    -webkit-box-orient:vertical;
    -webkit-line-clamp:4;
  }
  .news-expand-toggle {
    margin:2px 0 4px;
    padding:16px 12px;
    border:1px solid rgb(92 255 176 / 10%);
    border-radius:12px;
    background:rgb(10 13 17 / 78%);
    font-size:.62rem;
  }
}

@media (max-width:390px) {
  .nav-content { padding:0 10px; }
  .nav-icon-link { width:34px; height:34px; }
  .terminal-header { padding-left:8px; padding-right:8px; }
  .terminal-body { padding-left:8px; padding-right:8px; }
  .terminal-tab { padding:0 10px; }
  .news-entry { padding:14px 13px 15px; border-radius:13px; }
  .news-entry:hover { padding-left:13px; }
  .headline { font-size:.98rem; }
  .entry-summary { font-size:.74rem; -webkit-line-clamp:5; }
}

@media (prefers-reduced-motion:reduce) {
  * { scroll-behavior:auto!important; transition:none!important; animation:none!important; }
}
`;
