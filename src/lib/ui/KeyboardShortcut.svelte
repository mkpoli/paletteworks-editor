<script lang="ts">
  export let keys: readonly (string | readonly string[])[]

  const KEYBOARD_KEY_DISPLAY_NAMES: Record<string, string> = {
    'Backspace': '← Backspace',
    'Shift': '⇧ Shift',
    'Control': 'Ctrl',
    'Home': '↖ Home',
    '`': '`',
    ' ': '␣ Space',
    '\\': '\\',
    'a': 'A',
    'b': 'B',
    'c': 'C',
    'd': 'D',
    'e': 'E',
    'f': 'F',
    'g': 'G',
    'h': 'H',
    'i': 'I',
    'j': 'J',
    'k': 'K',
    'l': 'L',
    'm': 'M', 
    'n': 'N',
    'o': 'O',
    'p': 'P',
    'q': 'Q',
    'r': 'R',
    's': 'S',
    't': 'T',
    'u': 'U',
    'v': 'V',
    'w': 'W',
    'x': 'X',
    'y': 'Y',
    'z': 'Z',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '0': '0',
  }

  // TODO: Show real key from Keymap layout
  const KEYBOARD_CODE_DISPLAY_NAMES: Record<string, string> = {
    'Backquote': '`',
    'KeyA': 'A',
    'KeyB': 'B',
    'KeyC': 'C',
    'KeyD': 'D',
    'KeyE': 'E',
    'KeyF': 'F',
    'KeyG': 'G',
    'KeyH': 'H',
    'KeyI': 'I',
    'KeyJ': 'J',
    'KeyK': 'K',
    'KeyL': 'L',
    'KeyM': 'M',
    'KeyN': 'N',
    'KeyO': 'O',
    'KeyP': 'P',
    'KeyQ': 'Q',
    'KeyR': 'R',
    'KeyS': 'S',
    'KeyT': 'T',
    'KeyU': 'U',
    'KeyV': 'V',
    'KeyW': 'W',
    'KeyX': 'X',
    'KeyY': 'Y',
    'KeyZ': 'Z',
  }

  const KEYBOARD_DISPLAY_NAMES = {
    ...KEYBOARD_KEY_DISPLAY_NAMES,
    ...KEYBOARD_CODE_DISPLAY_NAMES
  }
</script>

<span>
  {#each keys as key}
    <span class="key">
      {#if key instanceof Array}
        {#each key as subKey}
          <span class="subKey">
            <kbd>{KEYBOARD_DISPLAY_NAMES[subKey]}</kbd>
          </span>
        {/each}
      {:else}
        <kbd>{KEYBOARD_DISPLAY_NAMES[key]}</kbd>
      {/if}
    </span>
  {/each}
</span>

<style>
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: normal;
  }

  kbd {
    display: block;
    padding: 0.25em 0.5em;
    background: rgba(0, 0, 0, 0.5);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.45);
    border-radius: 0.25em;
  }

  .key + .key::before {
    content: '|';
    margin: 0 0.25em;
  }

  .subKey + .subKey::before {
    content: '+';
    margin: 0 0.1em;
  }
</style>