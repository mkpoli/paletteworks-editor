<script lang="ts">
  import LL from '$i18n/i18n-svelte'

  import Modal from '$lib/ui/Modal.svelte'
  import Icon from '@iconify/svelte'
  import Button from '$lib/ui/Button.svelte'
  import ClickableIcon from '$lib/ui/ClickableIcon.svelte'

  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let opened: boolean
  export let value: [number, number]
  export let exist: boolean

  let p: number = 4
  let q: number = 4

  $: value = [p, q]

  let inputElement: HTMLInputElement

  function onkeydown(e: KeyboardEvent) {
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
  }
</script>

<Modal
  bind:opened
  on:opened={() => {
    inputElement.focus()
    inputElement.select()
  }}
>
  <template slot="activator" />
  <div slot="presentation">
    <h2>{$LL.editor.dialog.timeSignatureTitle()}</h2>
    <div class="close">
      <ClickableIcon
        icon="gridicons:cross"
        height="1.5em"
        on:click={() => {
          dispatch('cancel')
          opened = false
        }}
      />
    </div>
    <div class="input-container">
      <Icon icon="mdi:music-clef-treble" height="1.5em" />
      <Icon icon="ph:equals-bold" width="1em" />
      <input
        type="number"
        bind:value={p}
        bind:this={inputElement}
        on:keydown={onkeydown}
      />
      <span>/</span>
      <input type="number" bind:value={q} on:keydown={onkeydown} />
      <span>(拍子)</span>
    </div>
    <Button
      class="ok"
      icon={!exist ? 'mdi:plus-thick' : 'ic:sharp-edit'}
      on:click={() => {
        dispatch('ok')
        opened = false
      }}
    >
      {!exist ? $LL.editor.dialog.append() : $LL.editor.dialog.change()}
    </Button>
    {#if exist}
      <Button
        class="delete text"
        icon="mdi:delete"
        on:click={() => {
          dispatch('delete')
          opened = false
        }}
      >
        {$LL.editor.dialog.delete()}
      </Button>
    {/if}
  </div>
</Modal>

<style>
  [slot='presentation'] {
    padding: 1em;
    display: grid;
    gap: 2em;
    /* grid-template: 1fr auto / auto 1fr auto ; */
    grid-template-columns: repeat(5, 3em);
    grid-template-areas:
      'h h . . x'
      't t t t t'
      'd d . o o';
  }

  .close {
    height: auto;
    width: auto;
  }

  h2 {
    grid-area: h;
    display: block;
    margin: 0;
  }

  [slot='presentation'] :global(.ok) {
    grid-area: o;

    background: linear-gradient(180deg, #009c70 0%, #008080 100%);
  }

  [slot='presentation'] :global(.delete) {
    grid-area: d;

    background: transparent;
    color: #ff003d;
  }

  .input-container {
    grid-area: t;

    border: none;
    border-radius: var(--input-border-radius);
    color: inherit;
    padding: 0 1em;
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.6);
    background: rgba(255, 255, 255, 0.1);
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .input-container:focus-within {
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
    outline: 1px solid #fff;
  }

  .input-container * {
    flex-grow: 1;
    flex-shrink: 1;
  }

  .input-container > span,
  .input-container > :global(svg) {
    flex-shrink: 0;
  }

  input:focus {
    outline: none;
  }

  input {
    background: transparent;
    border: none;
    box-shadow: none;
    width: 100%;

    text-align: center;
  }

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
