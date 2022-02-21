<script lang="ts">
  // I18n
  import LL from '$i18n/i18n-svelte'

  // UI Components
  import Button from '$lib/ui/Button.svelte'
  import ClickableIcon from '$lib/ui/ClickableIcon.svelte'
  import Modal from '$lib/ui/Modal.svelte'

  // Events
  import { createEventDispatcher, getContext, onMount } from 'svelte'
  const dispatch = createEventDispatcher<{
    ok: void
    cancel: void
  }>()

  export let opened: boolean
  import { db, type Project } from '$lib/database'

  import toast from '$lib/ui/toast'

  import { DEFAULT_PREFERENCES, preferences as _preferences } from '$lib/preferences'
  import type { Preferences } from '$lib/preferences'
  import { download, dropHandler, formatFilename, SUPPORTED_FORMAT_KEYWORDS } from '$lib/basic/file'
  import type * as DexieExportImport from 'dexie-export-import'
  import Icon from '@iconify/svelte';
  import Tooltip from '$lib/ui/Tooltip.svelte';

  let preferences: Preferences

  let exportDB: typeof DexieExportImport.exportDB
  let importInto: typeof DexieExportImport.importInto

  onMount(async () => {
    ({ exportDB, importInto } = await import('dexie-export-import'))
  })

  let exampleFilename: string
  $: if (preferences) exampleFilename = formatFilename(preferences.fileSaveName, {
    project: getContext<Project | null>('currentProject')?.name ?? 'Untitled',
    title: getContext<Project | null>('currentProject')?.metadata?.title ?? 'Title',
    artist: getContext<Project | null>('currentProject')?.metadata?.artist ?? 'Artist',
    author: getContext<Project | null>('currentProject')?.metadata?.author ?? 'Author',
  })

  function restore(property: keyof Preferences) {
    (preferences[property] as any) = DEFAULT_PREFERENCES[property]
  }
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
        <label for="autosave-interval" on:dblclick={() => restore('autosaveInterval')}>{$LL.editor.preferences.autosaveInterval()}</label>
        <input type="number" name="autosave-interval" id="autosave-interval" min=0 bind:value={preferences.autosaveInterval}/>
        <label for="scroll-speed" on:dblclick={() => restore('scrollSpeed')}>{$LL.editor.preferences.scrollSpeed()}<span class="value">{preferences.scrollSpeed}x</span></label>
        <input type="range" name="scroll-speed" id="scroll-speed" min=0.00 max=20 step=0.1 bind:value={preferences.scrollSpeed}/>
        <label for="lane-width" on:dblclick={() => restore('laneWidth')}>{$LL.editor.preferences.laneWidth()}<span class="value">{preferences.laneWidth}</span></label>
        <input type="range" name="lane-width" id="lane-width" min=10 max=35 step=1 bind:value={preferences.laneWidth}/>
        <label for="note-height" on:dblclick={() => restore('noteHeight')}>{$LL.editor.preferences.noteHeight()}<span class="value">{preferences.noteHeight}x</span></label>
        <input type="range" name="note-height" id="note-height" min=0.5 max=1.25 step=0.01 bind:value={preferences.noteHeight}/>
        <label for="file-save-name" on:dblclick={() => restore('fileSaveName')}>{$LL.editor.preferences.fileSaveName()}
          <Tooltip
            placement="top"
          >
            <div slot="description">
              <span>{$LL.editor.preferences.fileSaveNameTooltip()}</span><br /><span>{SUPPORTED_FORMAT_KEYWORDS.join(', ')}</span>
            </div>
            <Icon icon="mdi:help-circle-outline" />
          </Tooltip>
        </label>
        <input type="text" name="file-save-name" bind:value={preferences.fileSaveName}/>
        <span class="example">{exampleFilename}</span>
        <div class="toggles">
          <input type="checkbox" name="minimap-enabled" bind:checked={preferences.minimapEnabled}/>
          <label for="minimap-enabled">{$LL.editor.preferences.minimapEnabled()}</label>
          <input type="checkbox" name="warning-enabled" bind:checked={preferences.multiTapWarningEnabled}/>
          <label for="warning-enabled">{$LL.editor.preferences.multiTapWarningEnabled()}</label>
        </div>
      </div>
      <Button
        class="export"
        icon="mdi:database-export-outline"
        on:click={async () => {
          try {
            const blob = await exportDB(db)
            await download(blob, 'db.json')
            toast.success($LL.editor.messages.database.exportSuccess())
          } catch (error) {
            toast.error($LL.editor.messages.database.exportFailed())
            console.error(error)
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

  label:not(:first-of-type) {
    margin-top: 0.2em;
  }

  .example {
    padding: 0 var(--input-padding-horizontal);
    font-style: italic;
  }
</style>
