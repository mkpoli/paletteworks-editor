<script lang="ts">
  import LL from '$i18n/i18n-svelte'

  import Modal from "$lib/ui/Modal.svelte"
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"

  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher<{
    ok: void,
    cancel: void,
  }>()

  export let opened: boolean

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

<svelte:window on:keydown={onkeydown}/>

<Modal bind:opened on:opened={() => {
  inputElement.focus()
  inputElement.select()
}}>
  <div slot="presentation">
    <h2>{$LL.editor.dialog.about()}</h2>
    <div class="close">
      <ClickableIcon
        icon="gridicons:cross"
        height="1.5em"
        on:click={() => { dispatch('cancel'); opened = false }}
      /> 
    </div>
    <div
      class="content-container"
    > 
      <span>v{process.env.PACKAGE_VERSION}</span>
      <br>
      <span>MIT License © 2021 <a href="https://mkpo.li/">mkpoli</a></span>
      <br>
      <div class="links">
        <Button class="text" icon="gridicons:house" href="https://paletteworks.mkpo.li/">
          Homepage (paletteworks.mkpo.li)
        </Button>
        <Button class="text" icon="mdi:github" href="https://github.com/mkpoli/paletteworks-editor">
          Github (mkpoli/paletteworks-editor)
        </Button>
        <Button class="text" icon="mdi:twitter" href="https://twitter.com/_mkpoli">
          Twitter (JA @_mkpoli)
        </Button>
        <Button class="text" icon="mdi:twitter" href="https://twitter.com/mkpoli_">
          Twitter (EN @mkpoli_)
        </Button>
        <Button class="text" icon="mdi:discord" href="https://discord.gg/rP2kCWtQ">
          Discord (PurplePalette#paletteworks)
        </Button>
      </div>
    </div>

    <Button
      class="ok"
      icon="ion:checkmark-round"
      on:click={() => { dispatch('ok'); opened = false }}
    >
      {$LL.editor.dialog.ok()}
    </Button>
  </div> 
</Modal>

<style>
  [slot=presentation] {
    padding: 1em;
    display: grid;
    gap: 2em;
    grid-template-columns: repeat(5, 3em);
    grid-template-areas:
      "h h h h h x"
      "t t t t t t"
      "t t t t t t"
      ". . . . o o"
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

  .content-container {
    grid-area: t;

    flex-grow: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .content-container .links {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: start;
  }

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>