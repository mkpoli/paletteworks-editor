<script lang="ts">
  // I18n
  import LL from '$i18n/i18n-svelte'

  // UI Components
  import Modal from '$lib/ui/Modal.svelte'
  import Button from '$lib/ui/Button.svelte'
  import ClickableIcon from '$lib/ui/ClickableIcon.svelte'
  import Icon from '@iconify/svelte'

  // Functions
  import { createEventDispatcher } from 'svelte'
  import type { Item } from '$lib/server/api'
  import type { Single, Slide } from '$lib/score/beatmap'
  import toast from '$lib/ui/toast'

  const dispatch = createEventDispatcher<{
    input: {
      singles?: Single[],
      slides?: Slide[]
    }
  }>()

  // Props
  export let opened: boolean
  let library: Item[] = []
  let loading: boolean = false
  $: console.log(library)
</script>

<Modal bind:opened on:opened={async () => {
  loading = true
  try {
    const res = await fetch('/library.json')
    library = await res.json()
  } catch (err) {
    toast.error($LL.editor.messages.loadingLibraryFailed())
    console.error(err)
  } finally {
    loading = false
  }
  // library = [
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   },
  //   {
  //     title: {
  //       ja: "こんにちは",
  //     },
  //     description: {
  //       ja: "こんにちは",
  //     },
  //     content: {}
  //   }
  // ]
}}>
  <div slot="presentation">
    <h2>{$LL.editor.dialog.libraryTitle()}</h2>
    <div class="close">
      <ClickableIcon
        icon="gridicons:cross"
        height="1.5em"
        on:click={() => { opened = false }}
      />
    </div>
    <div class="items">
      {#if loading}
        <Icon icon="eos-icons:loading" height="5em" width="5em" class="loading" />
      {:else}
        {#each library as item}
          <div class="item-container">
            <h3>{item.title.ja}</h3>
            <p>{item.description.ja}</p>
            <div class="image-container"></div>
            <Button
              class="add"
              icon="mdi:plus-thick"
              on:click={() => { dispatch('input', item.content) }}
            >
              {$LL.editor.dialog.append()}
            </Button>
          </div>
        {/each}
      {/if}
    </div>
  </div> 
</Modal>

<style>
  [slot=presentation] {
    padding: 1em;
    display: grid;
    gap: 2em;
    grid-template-columns: repeat(7, 3em);
    grid-template-areas:
      "h h . . . . x"
      "t t t t t t t"
      "t t t t t t t"
      "t t t t t t t"
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

  [slot=presentation] .items {
    grid-area: t;
    height: 50vh;
    overflow-y: auto;
    display: grid;
    gap: 1em;
    padding: 0 1em;
    grid-template-columns: repeat(auto-fill, minmax(8em, 1fr));
    grid-template-rows: repeat(auto-fill, 12em);
  }

  .item-container {
    border-radius: 5px;
    box-shadow: 0 0 3px 1px rgba(0, 0, 0, 0.2);
    background: linear-gradient(
      122deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    min-height: 10em;
    overflow: hidden;
    min-width: 0
  }
  
  .item-container p {
    display: block;
    margin: 0;
    padding: 0 0.5em;
  }

  .item-container h3 {
    display: block;
    margin: 0;
    padding: 0.5em;
    font-size: 1.2em;
  }

  .item-container :global(.add) {
    width: 100%;
    padding: 0.25em 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
    background: linear-gradient(122deg, rgba(255,87,171,1) 0%, rgba(207,50,168,1) 42%, rgba(199,64,255,1) 100%);
  }

  .image-container {
    height: 5em;
  }

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>