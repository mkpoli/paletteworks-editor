<script lang="ts">
  // I18n
  import LL from '$i18n/i18n-svelte'

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

  import toast from "$lib/ui/toast"

  import { preferences as _preferences } from '$lib/preferences'
  import type { Preferences } from '$lib/preferences'

  let preferences: Preferences
</script>

<Modal
  bind:opened
  on:opened={() => { preferences = $_preferences }}
>
  <div slot="presentation">
    {#if preferences}
      <h2>{$LL.editor.dialog.preferencesTitle()}</h2>
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
        <label for="autosave-interval">{$LL.editor.preferences.autosaveInterval()}</label>
        <input type="number" name="autosave-interval" min=0 bind:value={preferences.autosaveInterval}/>
        <label for="scroll-speed">{$LL.editor.preferences.scrollSpeed()}</label>
        <input type="number" name="scroll-speed" min=0.01 bind:value={preferences.scrollSpeed}/>
      </div>
      <Button
        class="ok"
        icon={'ic:sharp-edit'}
        on:click={() => {
          Object.entries(preferences).forEach(([key, value]) => {
            db.preferences.put({ key, value })
          })
          toast.success($LL.editor.messages.preferencesSaved())
          dispatch('ok'); opened = false
        }}
      >
        {$LL.editor.dialog.ok()}
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