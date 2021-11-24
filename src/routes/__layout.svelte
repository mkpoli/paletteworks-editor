<script>
  import '@mszu/pixi-ssr-shim'
</script>

<slot />

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Jura:wght@500&family=M+PLUS+1p:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>

<style global>
  :root {
    --color-background-main: #2e3142;
    --color-text-main: #eeeeee;
    --color-text-darker: #aaaaaa;
    --color-text-lighter: #ffffff;

    --input-border-radius: 10px;
    --input-padding: 0.75em 1em;

    /*Ωignore_startΩ*/
    color-scheme: dark;
    /*Ωignore_endΩ*/
    font-family: 'M PLUS 1p', sans-serif;
    overflow: hidden;
  }

  body {
    margin: 0;
    overflow: hidden;
  }

  * {
    box-sizing: border-box;
  }

  button, label, audio, select, input {
    cursor: inherit;
    font-size: inherit;
    font-family: inherit;
    min-width: 0;
  }

  input[type='text'] {
    appearance: none;
    border: none;
    border-radius: var(--input-border-radius);
    color: inherit;
    padding: var(--input-padding);
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.6);
    background: rgba(255, 255, 255, 0.1);
  }
</style>