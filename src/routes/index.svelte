<script lang="ts">
  import ClickableIcon from '$lib/ui/ClickableIcon.svelte'
</script>

<svelte:head>
  <title>PaletteWorks Editor - Homepage</title>
</svelte:head>

<header>
  <h1><img src="/favicon.png" alt="Logo" class="logo" />PaletteWorks Editor</h1>
  <nav>
    <a href="/edit">EXPORT DATA</a>
    <a
      href="https://wiki.purplepalette.net/create-charts/steps/create-chart/paletteworks"
      >COMMUNITY</a
    >
  </nav>
</header>
<main>
  <section class="description notice">
    <div class="container" style="display: block;">
      <h2 style="color: #ff6a75; text-shadow: 2px 2px 30px #ff6a75;">
        ⚠️ Project Discontinued / プロジェクト終了のお知らせ
      </h2>
      <p style="font-size: 1.2em; line-height: 1.5; margin-bottom: 2em;">
        Due to officials now explicitly discouraging the use of external
        unofficial apps, including official assets on external servers, we are
        discontinuing this project.<br />
        You can still export all your existing data to any format you want, but you
        cannot create new scores anymore.<br />
        <br />
        <a
          href="https://x.com/pj_sekai/status/2048729214900461995?s=20"
          target="_blank"
          rel="noreferrer"
          style="color: #55acee; text-decoration: underline;">Official Tweet</a
        ><br />
        <a
          href="https://youtu.be/yGUiG-CcS1E?t=4455"
          target="_blank"
          rel="noreferrer"
          style="color: #ff6a75; text-decoration: underline;"
          >Official Broadcast</a
        ><br />
      </p>
      <div
        style="background: rgba(0, 0, 0, 0.3); padding: 1.5em; border-radius: 10px; border-left: 5px solid #ff6a75; font-size: 1.1em; line-height: 1.6;"
      >
        <strong>【お知らせ】</strong><br />
        5月5日以降に、SNS等で外部非公式アプリの利用が確認された場合は公式大会・公式イベントへの参加禁止などのペナルティ措置を実施いたします。<br
        />
        ご理解とご協力のほど、よろしくお願いいたします。<br />
        <br />
        <a
          href="https://x.com/_mkpoli/status/2048756597833552109?s=20"
          target="_blank"
          rel="noreferrer"
          style="color: #55acee; text-decoration: underline;"
          >Our Statement (JP)</a
        ><br />
        <a
          href="https://x.com/_mkpoli/status/2048757400262615485?s=20"
          target="_blank"
          rel="noreferrer"
          style="color: #55acee; text-decoration: underline;"
          >Our Statement (EN)</a
        >
      </div>
      <a
        class="button"
        href="/edit"
        style="margin-top: 2em; background: #555555; color: #cccccc; box-shadow: none;"
        >GO TO EXPORT</a
      >
    </div>
  </section>
</main>

<footer>
  <div class="container">
    <div class="copyright">🄫 mkpoli</div>
    <div class="social">
      <ClickableIcon icon="logos:twitter" href="https://twitter.com/_mkpoli/" />
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
    gap: 0.5em;
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
    transition: color 0.2s ease-in-out;
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
    transition: all 0.2s ease-in-out;
  }

  a.button:hover {
    box-shadow: 0px 2px 5px #104376;
    text-shadow: 1px 1px 6px #8603ab;
    transform: translateY(-3px);
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
    transition: transform 0.2s ease-in-out;
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
    transition: 0.2s;
  }

  footer :global(a:hover) {
    filter: drop-shadow(0 0 3px #55acee);
    transform: scale(1.25);
  }
</style>
