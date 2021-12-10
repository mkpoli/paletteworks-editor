<script lang="ts">
  // UI Components
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"
  import Modal from "$lib/ui/Modal.svelte"

  // Events
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher<{
    ok: void
    cancel: void,
  }>()

  export let opened: boolean
  import { db } from '$lib/database'

  import { DEFAULT_PREFERENCES } from '$lib/consts'
  import toast from "$lib/ui/toast"

  let preferences: Record<keyof typeof DEFAULT_PREFERENCES, any>
</script>

<Modal bind:opened
  on:opened={async () => {
    preferences = Object.fromEntries(await Promise.all(Object.entries(DEFAULT_PREFERENCES).map(async ([key, value]) => {
      const data = await db.preferences.get(key)
      return [key, data ? data.value : value] 
    })))
  }}
>
  <div slot="presentation">
    {#if preferences}
      <h2>環境設定</h2>
      
      <div class="close">
        <ClickableIcon
          icon="gridicons:cross"
          height="1.5em"
          on:click={() => { dispatch('cancel'); opened = false }}
        />
      </div>
      <div
        class="form"
      >
        <label for="autosave-interval">自動保存の間隔（秒）</label>
        <input type="number" name="autosave-interval" min=0 bind:value={preferences.autosaveInterval}/>
        <label for="scroll-speed">スクロールの早さ（倍）</label>
        <input type="number" name="scroll-speed" min=0.01 bind:value={preferences.scrollSpeed}/>
      </div>
      <Button
        class="ok"
        icon={'ic:sharp-edit'}
        on:click={() => {
          Object.entries(preferences).forEach(([key, value]) => {
            db.preferences.put({ key, value })
          })
          toast.success('設定を保存しました')
          dispatch('ok'); opened = false
        }}
      >
        OK
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
    grid-template-columns: repeat(6, 3.2em);
    grid-template-rows: repeat(5, 3.2em);
    grid-template-areas:
      "h h h . . x"
      "t t t t t t"
      "t t t t t t"
      "t t t t t t"
      ". . . . o o"
  }

  .form {
    grid-area: t;

    display: flex;
    flex-direction: column;
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

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>