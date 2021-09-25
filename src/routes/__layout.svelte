<slot></slot>

<style global>
  :root {
    --color-background-main: #2e3142;
    --color-text-main: #eeeeee;
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
  }

  button {
    appearance: none;
    border: none;
    border-radius: 5px;
    color: inherit;
    padding: 0.5em 1em;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
    /* background: rgba(255, 255, 255, 0.1); */
    background: #003269;
  }

  button.text {
    box-shadow: none;
    border: none;
    background: transparent;
  }

  input[type='text'] {
    appearance: none;
    border: none;
    border-radius: 5px;
    color: inherit;
    padding: 0.5em 1em;
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.6);
    background: rgba(255, 255, 255, 0.1);
  }
</style>