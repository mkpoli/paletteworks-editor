<script lang="ts">
  import Modal from "$lib/ui/Modal.svelte"
  import Icon from '@iconify/svelte'
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"
  import TextInput from "$lib/ui/TextInput.svelte"

  import { createEventDispatcher, tick } from "svelte"
  const dispatch = createEventDispatcher()

  export let opened: boolean
  export let value: number
  export let exist: boolean

  let inputElement: HTMLInputElement
</script>

<Modal bind:opened on:open={async () => {
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
    <TextInput
      on:keydown={(e) => {
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
      }}
      bind:inputElement
      bind:value={value}
    >
      <div slot="head">
        <Icon icon="jam:music-f" height="1.5em" />
        <Icon icon="ph:equals-bold" width="1em" />
      </div>
      <div slot="tail">
        <span>(BPM)</span>
      </div>
    </TextInput>
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

  h2 {
    grid-area: h;
    display: block;
    margin: 0;
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

  [slot=presentation] :global(.input-container) {
    grid-area: t;
  }

  [slot=presentation] [slot=head] {
    display: flex;
    align-items: center;
    gap: 0.3em;
  }

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>