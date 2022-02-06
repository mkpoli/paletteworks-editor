<script lang="ts">
  // I18n
  import LL from '$i18n/i18n-svelte'

  // UI Components
  import Button from '$lib/ui/Button.svelte'
  import ClickableIcon from '$lib/ui/ClickableIcon.svelte'
  import Modal from '$lib/ui/Modal.svelte'

  // Events
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher<{
    ok: void
    cancel: void
  }>()

  export let opened: boolean
  import { db } from '$lib/database'

  import toast from '$lib/ui/toast'

  import { preferences as _preferences } from '$lib/preferences'
  import type { Preferences } from '$lib/preferences'
  import { download, dropHandler } from '$lib/basic/file'
  import type * as DexieExportImport from 'dexie-export-import'

  let preferences: Preferences

  let exportDB: typeof DexieExportImport.exportDB
  let importInto: typeof DexieExportImport.importInto

  onMount(async () => {
    ({ exportDB, importInto } = await import('dexie-export-import'))
  })
</script>

<Modal
  bind:opened
  on:opened={() => { preferences = $_preferences }}
>
  <div
    slot="presentation"
    on:dragover|preventDefault
    on:drop|preventDefault={dropHandler('application/json', (file) => {
      if (!confirm($LL.editor.messages.database.confirmImport())) return
      if (!confirm($LL.editor.messages.confirm())) return
      importInto(db, file, {
        clearTablesBeforeImport: true,
      }).then(() => {
        toast.success($LL.editor.messages.database.importSuccess())
        dispatch('cancel')
      }).catch((err) => {
        toast.error($LL.editor.messages.database.importFailed())
        console.error(err)
      })
    }, () => { toast.error($LL.editor.messages.unknownFileType()) })}
  >
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
        <label for="note-height">{$LL.editor.preferences.laneWidth()}<span class="value">{preferences.laneWidth}</span></label>
        <input type="range" name="note-height" min=10 max=35 step=1 bind:value={preferences.laneWidth}/>
        <label for="note-height">{$LL.editor.preferences.noteHeight()}<span class="value">{preferences.noteHeight}x</span></label>
        <input type="range" name="note-height" min=0.5 max=1.25 step=0.01 bind:value={preferences.noteHeight}/>
        <div class="toggles">
          <input type="checkbox" name="minimap-enabled" bind:checked={preferences.minimapEnabled}/>
          <label for="minimap-enabled">{$LL.editor.preferences.minimapEnabled()}</label>
        </div>
      </div>
      <Button
        class="export"
        icon="mdi:database-export-outline"
        on:click={async () => {
          try {
            const blob = await exportDB(db)
            download(blob, 'db.json')
            toast.success($LL.editor.messages.database.exportSuccess())
          } catch (error) {
            toast.error($LL.editor.messages.database.exportFailed())
            console.log(error)
          }
        }}
      >
        {$LL.editor.dialog.export()}
      </Button>
      <Button
        class="ok"
        icon="ic:sharp-edit"
        on:click={() => {
          Object.entries(preferences).forEach(([key, value]) => {
            db.preferences.put({ key, value })
          })
          toast.success($LL.editor.messages.preferencesSaved())
          dispatch('ok')
          opened = false
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
      "t t t t t t"
      "e e . . o o"
  }

  .form {
    grid-area: t;

    display: flex;
    flex-direction: column;
  }

  .toggles {
    margin-top: 1em;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.5em;
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

  [slot=presentation] :global(.export) {
    grid-area: e;
  }

  .close {
    grid-area: x;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .form label {
    display: flex;
    justify-content: space-between;
  }
</style>