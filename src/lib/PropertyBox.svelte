<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import type { Metadata } from "$lib/score/beatmap"
  const dispatch = createEventDispatcher()

  
  import Icon from '@iconify/svelte'
  import Button from "$lib/ui/Button.svelte"
  import ClickableIcon from "$lib/ui/ClickableIcon.svelte"
  import TextInput from "$lib/ui/TextInput.svelte"

  import filesize from 'filesize'
  import { selectedNotes } from "$lib/editing/selection"

  export let currentMeasure: number
  export let statistics: Record<string, number>
  export let paused: boolean
  export let metadata: Metadata
  export let files: FileList
  export let scrollMode: 'page' | 'smooth'
  export let visibility: Record<string, boolean>
</script>
<div class="panel-container">
  <div class="panel-bar">

  </div>
  <div class="panel">
    <h2>コントロール</h2>
      <div style="display: flex; gap: 0.5em;">
        <TextInput
          bind:value={currentMeasure}
        >
          <Icon icon="fontisto:hashtag" slot="head" style="flex-shrink: 0;"></Icon>
          <span slot="tail" style="white-space: nowrap;">（小節）</span>
        </TextInput>
        <Button
          icon="ph:arrow-bend-up-right-bold"
          on:click={() => {dispatch('goto')}}
        ></Button>
      </div>
      <ClickableIcon
        icon={paused ? 'ph:play-fill' : 'ph:pause-bold'}
        width="4.5em"
        on:click={() => { paused = !paused }}
      />
      <label>
        スクロール方式
        <select bind:value={scrollMode}>
          <option value={'page'}>ページ・スクロール</option>
          <option value={'smooth'}>スムーズ（再生ヘッド固定）</option>
        </select>
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
    <h2>統計</h2> 
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

  </div>  
  <div class="panel">
    <h2>音楽情報</h2>
    <label>
      音楽ファイル（.mp3）{#if files && files[0]}{filesize(files[0].size)}{/if}
      <input type="file" bind:files>
    </label>
    <label>
      オフセット
      <input type="text">
    </label>
  </div>
</div>

<style>
ul {
  padding: 0 2em;
}

ul.statistics {
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
  grid-template: repeat(3, auto) / repeat(2, auto);
  padding: 1em;
  gap: 1em;
}

.panel-bar {
  grid-column: 1 / 3;

  display: flex;
  gap: 1em;
}

.panel {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 1px 1px 5px #000;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  grid-template-rows: 32px;
  padding: 1.5em;
}

h2 {
  margin: 0;
}

label {
  display: grid;
}
</style>