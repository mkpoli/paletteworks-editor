<script lang="ts">
  import LL from '$i18n/i18n-svelte'
  import type { Metadata } from "$lib/score/beatmap"

  import { createEventDispatcher, tick } from "svelte"
  const dispatch = createEventDispatcher<{
    goto: void,
    undo: void,
    redo: void,
    skipstart: void,
    skipback: void,
  }>()

  // UI Components
  import Icon from '@iconify/svelte'
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from '$lib/ui/ClickableIcon.svelte'
  import TextInput from "$lib/ui/TextInput.svelte"
  import Select from '$lib/ui/Select.svelte'
  import FileInput from '$lib/ui/FileInput.svelte'
  import Tooltip from '$lib/ui/Tooltip.svelte'
  import Tabs from '$lib/ui/Tabs.svelte'
  import TabItem from '$lib//ui/TabItem.svelte'
  import TabSelect from '$lib/ui/TabSelect.svelte'
  import TabContent from '$lib//ui/TabContent.svelte'

  import filesize from 'filesize'
  import { selectedNotes } from "$lib/editing/selection"
  import { mutationHistory } from "$lib/editing/history"

  import { KEYBOARD_SHORTCUTS } from "$lib/control/keyboard"

  import { SCROLL_MODES } from '$lib/editing/scrolling'
  import type { ScrollMode } from '$lib/editing/scrolling'

  import { visibility, visibilitys, VisibilityType } from "$lib/editing/visibility"

  export let currentMeasure: number
  export let statistics: Record<VisibilityType, number>
  export let paused: boolean
  export let metadata: Metadata
  export let music: File | null
  export let musicLoadedFromFile: boolean
  export let scrollMode: ScrollMode
  export let totalCombo: number
  export let volume: number
  export let sfxVolume: number
  export let sfxEnabled: boolean
  export let bgmLoading: boolean
  export let musicDuration: number | undefined

  let historyDiv: HTMLDivElement

  let hidden: boolean = false

  $: if ($mutationHistory) {
    tick().then(() => {
      historyDiv.scrollTo(0, historyDiv.scrollHeight)
    })
  }

  $: scrollModes = SCROLL_MODES.map(mode => [mode, $LL.editor.scrollmode[mode]()]) as [ScrollMode, string][]

  function formatTime(time: number): string {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor((time % 1) * 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
  }
</script>
<div class="panel-hider" class:hidden>
  <div>
    <button on:click={() => { hidden = !hidden }}>
      <Icon icon={hidden ? 'codicon:triangle-left' : 'codicon:triangle-right'}></Icon>
    </button>
  </div>
</div>
<div class="panel-container" class:hidden>
  <div class="panel">
    <h2>{$LL.editor.panel.control()}</h2>
      <div style="display: flex; gap: 0.5em;">
        <TextInput
          bind:value={currentMeasure}
        >
          <Icon icon="fontisto:hashtag" slot="head" style="flex-shrink: 0;"></Icon>
          <span style="white-space: nowrap;" slot="tail">{$LL.editor.panel.measure()}</span>
          <Button
            slot="action"
            class="action"
            icon="ph:arrow-bend-up-right-bold"
            width="1.8em"
            on:click={() => {dispatch('goto')}}
          ></Button>
        </TextInput>
      </div>
      <div style="text-align: center;">
        {musicDuration ? formatTime(musicDuration) : '--:--.---'}
      </div>
      <div class="control-buttons">
        <Tooltip
          placement="bottom"
          description={$LL.editor.panel.skipstart()}
          keys={KEYBOARD_SHORTCUTS.skipstart}
        >
          <ClickableIcon
            icon="fluent:previous-16-filled"
            width="2.5em"
            on:click={() => { dispatch('skipstart') }}
          />
        </Tooltip>
        <Tooltip
          placement="bottom"
          description={$LL.editor.panel.playpause()}
          keys={KEYBOARD_SHORTCUTS.playpause}
        >
          <ClickableIcon
            icon={paused ? 'carbon:play-filled-alt' : 'ph:pause-duotone'}
            width="4.5em"
            on:click={() => { paused = !paused }}
          />
        </Tooltip>
        <Tooltip
          placement="bottom"
          description={$LL.editor.panel.skipback()}
          keys={KEYBOARD_SHORTCUTS.skipback}
        >
          <ClickableIcon
            icon="ph:arrow-counter-clockwise-bold"
            width="2.5em"
            on:click={() => { dispatch('skipback') }}
          />
        </Tooltip>
      </div>
      <label for="scroll">
        {$LL.editor.panel.scrollmode()}
        <Select
          bind:value={scrollMode}
          options={scrollModes}
          name="scroll"
        />
      </label>
  </div>
  <div class="panel">
    <h2>{$LL.editor.panel.metadata()}</h2>
    <label for="title">
      {$LL.editor.panel.title()}
      <TextInput type="text" name="title" bind:value={metadata.title}/>
    </label>
    <label for="artist">
      {$LL.editor.panel.artist()}
      <TextInput type="text" name="artist" bind:value={metadata.artist}/>
    </label>
    <label for="author">
      {$LL.editor.panel.author()}
      <TextInput type="text" name="author" bind:value={metadata.author}/>
    </label>
  </div>
  <div class="panel">
    <Tabs>
      <TabSelect>
        <TabItem><h2>{$LL.editor.panel.statistics()}</h2></TabItem>
        <TabItem><h2>{$LL.editor.panel.history()}</h2></TabItem>
      </TabSelect>
      <TabContent class="statistics">
        <ul class="visibility">
          {#each visibilitys as name}
            <li class:visible={$visibility[name]}>
              <ClickableIcon
                icon={$visibility[name] ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                width="1.5em"
                on:click={() => {
                  $visibility[name] = !$visibility[name]
                  if (name === 'all') {
                    for (const type of visibilitys) {
                      $visibility[type] = $visibility[name]
                    }
                  }
                }}
              />
              <span class="title">{$LL.editor.panel.visibility[name]()}</span><span class="value">{statistics[name]}</span>
            </li>
          {/each}
          <li class="other">
            <Icon icon="fa-solid:drum" width="1.5em" />
            <span>{$LL.editor.panel.totalcombo()}</span>
            <span class="value combo">{totalCombo}</span>
          </li>
          <li class="other">
            <Icon icon="mdi:select-group" width="1.5em" />
            <span>{$LL.editor.panel.totalselected()}</span>
            <span class="value">{$selectedNotes.length}</span>
          </li>
        </ul>
      </TabContent>
      <TabContent class="history-tab">
        <div class="actions">
          <Tooltip
            placement="bottom"
            keys={KEYBOARD_SHORTCUTS.undo}
          > 
            <Button icon="ic:round-undo" on:click={() => dispatch('undo')} class="history-button">{$LL.editor.panel.undo()}</Button>
          </Tooltip>
          <Tooltip
            placement="bottom"
            keys={KEYBOARD_SHORTCUTS.redo}
          >
            <Button icon="ic:round-redo" on:click={() => dispatch('redo')} class="history-button">{$LL.editor.panel.redo()}</Button>
          </Tooltip>
        </div>
        <div class="history" bind:this={historyDiv}>
          {#each $mutationHistory as mutation, index}
            <span>{`#${index + 1} - ${mutation}`}</span>
          {/each}
        </div>
      </TabContent>
    </Tabs>
  </div>  
  <div class="panel">
    <h2>{$LL.editor.panel.music()}</h2>
    <label for="music">
      {$LL.editor.panel.musicfile()} {music ? filesize(music.size) : ''}
      <FileInput
        bind:file={music}
        on:open={() => { musicLoadedFromFile = true }}
        accept="audio/*"
        name="music"
        openIcon="mdi:folder-music"
        fileIcon="mdi:file-music-outline"
        text={$LL.editor.panel.open()}
        loading={bgmLoading}
      />
    </label>
    <label for="offset">
      {$LL.editor.panel.offset()}
      <TextInput
        bind:value={metadata.offset}
        type="number"
        name="offset"
      >
        <span slot="tail">{$LL.editor.panel.seconds()}</span>
      </TextInput>
    </label>
    <label>
      {$LL.editor.panel.master()}
      <input type="range" bind:value={volume} min=0 max=1 step=0.01 />
    </label>
    <label>
      <span>{$LL.editor.panel.sfxvolume()}<input type="checkbox" bind:checked={sfxEnabled} /></span>
      <input type="range" bind:value={sfxVolume} min=0 max=1 step=0.01 on:change={() => { sfxEnabled = true }} />
    </label>
  </div>
</div>

<style>
.panel-hider {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 1em;
}

.panel-hider > div > button {
  appearance: none;
  border: none;
  background: none;
  
  padding: 0;
  position: relative;
  left: -0.5em;
  height: 100%;

  justify-content: center;
  align-items: center;
}

.panel-hider > div {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 7em;
  width: 0;
  text-align: center;
  border-left: 1em solid rgba(0, 0, 0, 0.3);
	border-top: 1em solid transparent;
	border-bottom: 1em solid transparent;
}

.panel-hider > div:hover {
  border-left: 1em solid rgba(0, 0, 0, 0.2);
}

.panel-hider.hidden > div {
	border-top: 1em solid transparent;
  border-right: 1em solid rgba(0, 0, 0, 0.3);
	border-bottom: 1em solid transparent;
  border-left: none;
}

.panel-hider.hidden > div > button {
  left: 0.5em;
}

.panel-container.hidden {
  margin-right: -100%;
}

:global(.statistics) {
  font-size: 1.2em;
  display: flex;
  flex-direction: column;
  gap: 2em;
  /* justify-content: space-between; */
}

:global(.statistics) ul {
  width: auto;
  margin: 0 auto;
  padding: 0;
  display: grid;
  gap: .4em 0;
  grid-template-columns: auto 1fr 4em;
  list-style-type: none;
}

:global(.statistics) ul li {
  display: contents;
}

:global(.statistics) ul li :global(svg) {
  margin-right: 1em;
  min-width: 1em;
}

:global(.statistics) ul.visibility li:not(.visible, .other) {
  color: rgba(238, 238, 238, 0.8);
}

:global(.statistics) ul li.other > :global(*) {
  margin: 1em 0em;
}

:global(.statistics) span.combo {
  position: relative;
}

:global(.statistics) span.combo:after {
  content: 'x';
  position: absolute;
  left: calc(100% + 0.1em);
}

ul .title {
  font-weight: bold;
  display: block;
  width: 5em;
}

ul .value {
  /* display: block;
  width: 5em; */
  text-align: right;
  align-self: end;
}

.panel-container {
  display: grid;
  grid-template: repeat(2, 1fr) / repeat(2, 1fr);
  height: 100vh;
  padding: 0.85em;
  padding-left: 0.25em;
  gap: 0.65em 0.85em;
  overflow-y: auto;
  overflow-x: hidden;
}

@media (max-width: 1280px) {
  .panel-container {
    grid-template: repeat(4, 1fr) / repeat(1, 1fr);
  }
}

.panel {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
  border-radius: 0.5em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1em 1.5em;
  justify-content: flex-start;
}

h2 {
  margin: 0;
}

label {
  display: grid;
}

label > span {
  display: flex;
  align-items: center;
}

.history {
  display: flex;
  flex-direction: column;

  overflow-y: scroll;
  height: 100%;
  max-height: 100%;
  flex-grow: 1;
}

:global(.history-tab) {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 1em;
}

:global(.history-tab) > .actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
  font-size: 0.75em;
}

:global(.history-tab) :global(.history-button) {
  border-radius: 0.5em;
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
}
</style>