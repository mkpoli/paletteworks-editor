<script lang="ts">
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"
  import screenshot from '$assets/screenshot.png'
</script>
<header>
  <h1><img src="/favicon.png" alt="Logo" class="logo"/>PaletteWorks Editor</h1>
  <nav>
    <a href="#">DOWNLOAD</a>
    <a href="#">FEATURES</a>
    <a href="#">COMMUNITY</a>
  </nav>
</header>
<main>
<section class="description">
  <div class="container">
    <h2>PaletteWorks Editor とは</h2>
    <p>PaletteWorks Editor とは創作譜面ファンの中から生まれた新世代の譜面エディター。使いやすさを第一の目標として職人が手掛けたツール。スムーズな編輯体験を提供。</p>
    <a class="button" href="/edit">今すぐ始める</a>
    <img src={screenshot} alt="screenshot"/>
  </div>
</section>

<section class="functionality">
  <div class="container">
    <h2>編集機能</h2>
    <p>基本な編集機能を直感的にリニューアル！譜面の作成・編集を自由自在に行えるツールで無限の想像力を思いつくす限り</p>
    <h2>SUS譜面の入出力</h2>
    <p>SUS (Sliding Universal Score) ファイルの入出力。そのまま Sonolus などでプレイ可能。</p>
    <h2>音楽の同時視聴</h2>
    <p>音楽を見ながら譜面の製作ができ、さらにまるでゲーム中のようなシミュレーションも可能。</p>
  </div>
</section>

<section class="contact">
  
</section>
</main>


<footer>
  <div class="copyright">
    🄫 mkpoli
  </div>
  <div class="social">
    <ClickableIcon icon="logos:twitter" href="https://twitter.com/_mkpoli/"/>
  </div>
</footer>

<style>
  :global(body) {
    background: var(--color-background-main);
    color: var(--color-text-main);
    margin: 0;
    font-family: 'FOT-RodinNTLG Pro';
    overflow-y: auto;
    height: 100vh;
  }
  
  header {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  h1 {
    gap: 1em;
  }

  .logo {
    height: 2em;
    width: 2em;
  }

  nav {
    display: flex;
  }

  h1 {
    font-size: 1.5em;
    display: flex;
    align-items: center;
  }

  nav a {
    padding: 2em;
    text-decoration: none;
    color: inherit;
    font-size: 1.5em;
    font-weight: bolder;
  }

  main {
    display: flex;
    flex-direction: column;
  }

  section {
    /* background: white; */
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(60em, 1024px) minmax(0, 1fr);
    width: 100%;
    padding: 1em 0;
  }

  section .container {
    margin: 0 auto;
    grid-column: 2 / -2;
    
  }

  section.description {
    background-color: #1b063d;
    color: var(--color-text-main);
  }

  section.description > .container {
    display: grid;
    grid-template-rows: auto auto auto;
    grid-template-columns: 50% 50%;
    grid-auto-flow: column;
    gap: 2em;
    /* justify-content: center; */
    /* justify-items: center; */
    align-items: center;
  }

  section.description img {
    grid-row: 1 / -1;
    grid-column: 2 / -1;
    height: 25em;
  }
  
  section.functionality > .container {
    display: grid;
    /* grid-template-columns: repeat(2, 1fr); */
    grid-template-rows: repeat(2, auto);
    grid-auto-flow: column;
    gap: 2em;
  }

  .description h2 {
    text-shadow: 2px 2px 30px #8603ab;
  }

  a.button {
    display: block;
    font-size: 3em;
    /* margin: 1em 0em; */
    padding: 1rem 2rem;
    background: #00e9ba;
    border-radius: 15px;
    width: auto;
    height: auto;
    /* border: solid 1px aquamarine; */
    /* color: aquamarine; */
    color: inherit;
    text-decoration: none;
    text-align: center;
    font-weight: bold;
    text-shadow: 1px 1px 3px saddlebrown;
  }

  a:visited {
    color: aliceblue;
    /* color: inherit; */
  }

  footer {
    margin: 0 auto;
    max-width: 1024px;
    
    padding: 2em 0;

    gap: 1em;

    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>