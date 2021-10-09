<script lang="ts">
  import Modal from "$lib/basic/Modal.svelte"
  import Icon from '@iconify/svelte'
  import Button from "$lib/basic/Button.svelte"
  import ClickableIcon from "$lib/basic/ClickableIcon.svelte"

  import { createEventDispatcher, tick } from "svelte"
  const dispatch = createEventDispatcher()

  export let opened: boolean
  export let value: number
  export let exist: boolean

  let valueString: string
  $: if (valueString) value = Number.parseFloat(valueString)

  let inputElement: HTMLInputElement
</script>

<Modal bind:opened on:open={async () => {
  valueString = `${value}`
  await tick()
  inputElement.focus()
  inputElement.select()
}}>
  <template slot="activator">
    
  </template>
  <div slot="presentation">
    <h2>BPM設定</h2>
    <div class="close">
      <ClickableIcon
        icon="gridicons:cross"
        height="1.5em"
        on:click={() => { dispatch('cancel'); opened = false }}
      />
    </div>
    <div class="input-container">
      <Icon icon="jam:music-f" height="1.5em" />
      <Icon icon="ph:equals-bold" width="1em" />
      <input type="text" name="bpm" bind:value={valueString} bind:this={inputElement} on:keydown={(e) => {
        switch (e.key) {
          case 'Enter':
            dispatch('ok')
            opened = false
            break
          case 'Escape':
            dispatch('cancel')
            opened = false
            break
        }
      }}>
      <label for="bpm">(BPM)</label>
    </div>
    <Button
      class="ok"
      icon={!exist ? 'mdi:plus-thick' : 'ic:sharp-edit'}
      on:click={() => { dispatch('ok'); opened = false }}
    >
      {!exist ? '追加' : '変更'}
    </Button>
    {#if exist}
      <Button
        class="delete text"
        icon="mdi:delete"
        on:click={() => { dispatch('delete'); opened = false }}
      >
        削除
      </Button>
    {/if}
  </div> 
</Modal>

<style>
  [slot=presentation] {
    padding: 1em;
    display: grid;
    gap: 2em;
    /* grid-template: 1fr auto / auto 1fr auto ; */
    grid-template-columns: repeat(5, 3em);
    grid-template-areas:
      "h h . . x"
      "t t t t t"
      "d d . o o"
  }

  .close {
    height: auto;
    width: auto;
  }

  button {
    display: flex;
    gap: 0.5em;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .input-container {
    border: none;
    border-radius: 5px;
    color: inherit;
    padding: 0.5em 1em;
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.6);
    background: rgba(255, 255, 255, 0.1);
    grid-area: t;
    display: flex;
    align-items: center;
  }

  .input-container:focus-within {
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
  }

  input {
    background: transparent;
    border: none;
    box-shadow: none;
  }
  
  input:focus {
    outline: none
  }

  h2 {
    grid-area: h;
    display: block;
    margin: 0;
  }

  label {
    grid-area: l;
  }

  [slot=presentation] :global(.ok) {
    grid-area: o;

    background: linear-gradient(180deg, #009C70 0%, #008080 100%);
  }

  [slot=presentation] :global(.delete) {
    grid-area: d;

    background: transparent;
    color: #FF003D;
  }

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>