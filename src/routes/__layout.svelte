<script>
  import '@mszu/pixi-ssr-shim'
</script>

<slot />

<style global>
  :root {
    --color-background-main: #2e3142;
    --color-text-main: #eeeeee;

    --input-border-radius: 10px;

    color-scheme: dark;
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
    padding: 0.5em 1em;
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.6);
    background: rgba(255, 255, 255, 0.1);
  }
</style>