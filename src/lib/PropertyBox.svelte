<script lang="ts">
  import type { Metadata } from "$lib/score/beatmap"
  import type { Mutation } from "$lib/editing/mutations"

  import { createEventDispatcher, tick } from "svelte"
  const dispatch = createEventDispatcher<{
    goto: void,
    undo: void,
    redo: void,
  }>()

  // UI Components
  import Icon from '@iconify/svelte'
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from '$lib/ui/ClickableIcon.svelte'
  import TextInput from "$lib/ui/TextInput.svelte"
  import Select from '$lib/ui/Select.svelte'
  import FileInput from '$lib/ui/FileInput.svelte'

  import Tabs from '$lib/ui/Tabs.svelte'
  import TabItem from '$lib//ui/TabItem.svelte'
  import TabSelect from '$lib/ui/TabSelect.svelte'
  import TabContent from '$lib//ui/TabContent.svelte'

  import filesize from 'filesize'
  import { selectedNotes } from "$lib/editing/selection"
  import { mutationHistory } from "$lib//editing/history"

  export let currentMeasure: number
  export let statistics: Record<string, number>
  export let paused: boolean
  export let metadata: Metadata
  export let files: FileList
  export let scrollMode: 'page' | 'smooth'
  export let visibility: Record<string, boolean>
  export let volume: number

  let historyDiv: HTMLDivElement
  

  $: if ($mutationHistory) {
    tick().then(() => {
      historyDiv.scrollTo(0, historyDiv.scrollHeight)
    })
  }
</script>
<div class="panel-container">
  <div class="panel">
    <h2>コントロール</h2>
      <div style="display: flex; gap: 0.5em;">
        <TextInput
          bind:value={currentMeasure}
        >
          <Icon icon="fontisto:hashtag" slot="head" style="flex-shrink: 0;"></Icon>
          <span style="white-space: nowrap;" slot="tail">（小節）</span>
          <Button
            slot="action"
            class="action"
            icon="ph:arrow-bend-up-right-bold"
            width="1.8em"
            on:click={() => {dispatch('goto')}}
          ></Button>
        </TextInput>
      </div>
      <ClickableIcon
        icon={paused ? 'ph:play-fill' : 'ph:pause-duotone'}
        width="4.5em"
        on:click={() => { paused = !paused }}
      />
      <label for="scroll">
        スクロール方式
        <Select
          bind:value={scrollMode}
          options={[
            ['page', '上下スクロール'],
            ['smooth', '固定スクロール']
          ]}
          name="scroll"
        />
      </label>
  </div>
  <div class="panel">
    <h2>基本情報</h2>
    <label>
      タイトル
      <input type="text" bind:value={metadata.title}>
    </label>
    <label>
      アーティスト
      <input type="text" bind:value={metadata.artist}>
    </label>
    <label>
      譜面作者
      <input type="text" bind:value={metadata.author}>
    </label>
  </div>
  <div class="panel">
    <Tabs>
      <TabSelect>
        <TabItem><h2>統計</h2></TabItem>
        <TabItem><h2>履歴</h2></TabItem>
      </TabSelect>
      <TabContent>
        <ul class="statistics">
          {#each Object.entries(statistics) as [ name, value ]}
            <li>
              <ClickableIcon
                icon={visibility[name] ? 'ic:baseline-visibility' : 'ic:baseline-visibility-off'}
                width="1.5em"
                on:click={() => {
                  visibility[name] = !visibility[name]
                  if (name === 'Total') {
                    Object.keys(visibility).forEach((key) => {
                      visibility[key] = visibility[name]
                    })
                  }
                }}
              />
              <span class="title">{name}</span><value>{value}</value>
            </li>
          {/each}
          <li><p>選択されたアイテム数 {$selectedNotes.length}</p></li>
        </ul>
      </TabContent>
      <TabContent class="history-tab">
        <div class="actions">
          <Button icon="ic:round-undo" on:click={() => dispatch('undo')} class="history-button">元に戻す</Button>
          <Button icon="ic:round-redo" on:click={() => dispatch('redo')} class="history-button">やり直し</Button>
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
    <h2>音楽情報</h2>
    <label for="music">
      音楽ファイル {files && files[0] ? filesize(files[0].size) : ''}
      <FileInput
        bind:files
        accept="audio/*"
        name="music"
        openIcon="mdi:folder-music"
        fileIcon="mdi:file-music-outline"
        text="音楽ファイルを開く"
      />
    </label>
    <label>
      音量
      <input type="range" bind:value={volume} min=0 max=1 step=0.01 />
    </label>
  </div>
</div>

<style>
ul.statistics {
  width: auto;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;

  list-style-type: none;
}

ul.statistics li {
  display: flex;
  gap: 1em;
}

ul .title {
  font-weight: bold;
  display: block;
  width: 5em;
}

.panel-container {
  display: grid;
  grid-template: repeat(2, 1fr) / repeat(2, 1fr);
  height: 100vh;
  padding: 0.85em;
  gap: 0.65em 0.85em;
}

.panel {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
  border-radius: 0.5em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em 1.5em;
  max-width: 100%;
  max-height: 100%;
  min-width: 0;
  min-height: 0;
  justify-content: start;
}

h2 {
  margin: 0;
}

label {
  display: grid;
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

</style>