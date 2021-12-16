<script lang="ts">
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"
  import Icon from '@iconify/svelte'

  import screenshot from '$assets/homepage/screenshot.png'
  import editing from '$assets/homepage/editing.png'
  import soundeffects from '$assets/homepage/soundeffects.png'
  import filesupport from '$assets/homepage/filesupport.png'
</script>

<svelte:head>
  <title>PaletteWorks Editor - Homepage</title>
</svelte:head>

<header>
  <h1><img src="/favicon.png" alt="Logo" class="logo"/>PaletteWorks Editor</h1>
  <nav>
    <a href="/edit">CREATE NOW</a>
    <a href="#functionality">FEATURES</a>
    <a href="https://wiki.purplepalette.net/create-charts/steps/create-chart/paletteworks">COMMUNITY</a>
  </nav>
</header>
<main>
<section class="description">
  <div class="container">
    <h2>PaletteWorks Editor とは</h2>
    <p>PaletteWorks Editor とは創作譜面ファンの中から生まれた新世代の譜面エディター。使いやすさを第一の目標として職人が手掛けたツール。編集を自由自在に行えるこのツールで、スムーズで一流な譜面制作体験を提供します。</p>
    <a class="button" href="/edit">今すぐ始める</a>
    <img src={screenshot} alt="screenshot"/>
  </div>
</section>

<section id="functionality">
  <div class="container">
    <h2><Icon icon="mdi:draw"/>編集機能</h2>
    <img src={editing} alt="editing"/>
    <p>基本な編集機能を直感的にリニューアル！多種多様なノーツをシンプルに配置・削除・変更できるのみならず、コピーペースト機能・選択機能・ミラー機能などの便利機能も備えており、効率を倍増できます。</p>

    <h2><Icon icon="mdi:file-chart"/>SUS譜面の入出力</h2>
    <img src={filesupport} alt="filesupport"/>
    <p>SUS (Sliding Universal Score) ファイルの入出力を最初からファーストクラスとし、そのまま Sonolus などでプレイ可能。更に譜面を画像として出力することもでき、譜面制作者コミュニティで簡単にシェアや交流が可能。</p>

    <h2><Icon icon="mdi:headphones"/>音声の同時視聴</h2>
    <img src={soundeffects} alt="soundeffects"/>
    <p>BGMの音楽を聞きながら編集することができるだけではなく、SE付きの音声によってまるでゲームをプレイしながらの制作が可能。</p>
  </div>
</section>

<section class="contact">
  
</section>
</main>


<footer>
  <div class="container">
    <div class="copyright">
      🄫 mkpoli
    </div>
    <div class="social">
      <ClickableIcon icon="logos:twitter" href="https://twitter.com/_mkpoli/"/>
    </div>
  </div>
</footer>

<style>
  :global(body) {
    background: var(--color-background-main);
    color: var(--color-text-main);
    margin: 0;
    overflow-y: auto;
    height: 100vh;
  }
  
  header {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo {
    height: 2em;
    width: 2em;
  }

  nav {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 3em;
  }

  h1 {
    gap: .5em;
    font-family: 'Jura';
    font-size: 2em;
    display: flex;
    align-items: center;
  }

  nav a {
    padding: 1em;
    text-decoration: none;
    color: var(--color-text-darker);
    font-family: 'Jura';
    font-size: 1.5em;
    font-weight: bolder;
    transition: color .2s ease-in-out;
  }

  nav a:visited {
    color: var(--color-text-darker);
  }
  
  nav a:hover {
    color: var(--color-text-lighter);
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

  section .container,
  footer .container {
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
    gap: 0 2em;
    /* justify-content: center; */
    /* justify-items: center; */
    align-items: center;
  }

  section.description img {
    grid-row: 1 / -1;
    grid-column: 2 / -1;
    height: 25em;
  }

  .description h2 {
    text-shadow: 2px 2px 30px #8603ab;
    font-size: 2em;
  }

  a.button {
    display: block;
    font-size: 3em;
    /* margin: 1em 0em; */
    padding: 1rem 2rem;
    background: #2980d7;
    border-radius: 15px;

    width: auto;
    height: auto;
    /* border: solid 1px aquamarine; */
    /* color: aquamarine; */
    color: inherit;
    text-decoration: none;
    text-align: center;
    font-weight: bold;
    text-shadow: 1px 1px 3px #8603ab;
    margin: 0.5 1em;
  }

  a.button:hover {
    box-shadow: 0px 0px 10px #2980d7;
    text-shadow: 1px 1px 6px #8603ab;
  }

  a:visited {
    color: aliceblue;
    /* color: inherit; */
  }

  section#functionality > .container {
    display: grid;
    /* grid-template-columns: repeat(2, 1fr); */
    grid-template-rows: repeat(3, auto);
    grid-auto-flow: column;
    gap: 0 2em;
  }

  section#functionality > .container > img {
    height: 15em;
    border-radius: 1em;
    box-shadow: 0 0 10px #2980d7;
    transition: transform .2s ease-in-out;
  }

  section#functionality > .container > img:hover {
    transform: scale(1.1);
  }

  section#functionality h2 {
    display: flex;
    align-items: center;
    gap: 0.2em;
  }

  section#functionality h2 > :global(svg) {
    font-size: 1.5em;
  }

  section#functionality h2:nth-of-type(1) > :global(svg) {
    color: #ff6a75;
    filter: drop-shadow(0 0 2px #ff6a75);
  }
  section#functionality h2:nth-of-type(2) > :global(svg) {
    color: #00a7fa;
    filter: drop-shadow(0 0 2px #00a7fa);
  }
  section#functionality h2:nth-of-type(3) > :global(svg) {
    color: #d880e5;
    filter: drop-shadow(0 0 2px #d880e5);
  }

  footer {
    padding: 2em 0;
    gap: 1em;
    width: 100%;
  }

  footer > .container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
  }

  footer :global(a) {
    transition: .2s;
  }

  footer :global(a:hover) {
    filter: drop-shadow(0 0 3px #55acee);
    transform: scale(1.25);
  }
</style>