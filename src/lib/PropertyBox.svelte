<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import type { MetaData } from "./beatmap"
  const dispatch = createEventDispatcher()

  import IconButton from "./basic/IconButton.svelte"

  import filesize from 'filesize'

  export let currentMeasure: number
  export let statistics: Record<string, number>
  export let paused: boolean
  export let metadata: MetaData
  export let files: FileList
  export let scrollMode: 'page' | 'smooth'
</script>

<div class="panel-container">
  <div class="panel">
    <h2>コントロール</h2>
    <label for="goto">Goto Measure</label>
      <div style="display: flex; gap: 0.5em;">
        <input type="text" bind:value={currentMeasure} name="goto" />
        <button
          on:click={() => {dispatch('goto')}}
        >Goto</button>
      </div>
      <IconButton
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
      <button on:click={() => { dispatch('export') }}>
        Export to PNG
      </button>
  </div>
  <div class="panel">
    <h2>基本情報</h2>
    <label>
      タイトル
      <input type="text" bind:value={metadata.title}>
    </label>
    <label>
      アーティスト
      <input type="text">
    </label>
    <label>
      譜面作者
      <input type="text">
    </label>
  </div>
  <div class="panel">
    <h2>統計</h2>
    <ul>
      {#each Object.entries(statistics) as [ name, value ]}
        <li>{`${name}: ${value}`}</li>
      {/each}
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
.panel-container {
  display: grid;
  grid-template: repeat(2, auto) / repeat(2, auto);
  padding: 1em;
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