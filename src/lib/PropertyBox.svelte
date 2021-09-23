<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { MetaData } from "./beatmap";
  const dispatch = createEventDispatcher()

  import filesize from 'filesize'

  export let playhead: number
  export let currentMeasure: number
  export let statistics: Record<string, number>
  export let player: HTMLAudioElement
  export let paused: boolean
  export let currentTime: number
  export let metadata: MetaData
  export let files: FileList
</script>

<div class="panel-container">
  <div class="panel">
    <h2>コントロール</h2>
    <!-- <label> -->
      Playhead {playhead.toFixed(3)}
      <!-- <input type="range" bind:value={playhead} min={0} max={fullHeight}>
    </label> -->
    <label for="goto">Goto Measure</label>
      <div style="display: flex; gap: 0.5em;">
        <input type="text" bind:value={currentMeasure} name="goto" />
        <button
          on:click={() => {dispatch('goto')}}
        >Goto</button>
      </div>    
      <audio controls
        src={files && files[0] ? URL.createObjectURL(files[0]) : undefined }
        bind:this={player}
        bind:currentTime
        bind:paused
      ></audio>
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
    <h2>音楽情報</h2>
    <label>
      音楽ファイル（.mp3）{#if files && files[0]}{filesize(files[0].size)}{/if}
      <input type="file" bind:files>
    </label>
    <label>
      オフセット
      <input type="text">
    </label>
    <label>
      BPM
      <input type="text">
    </label>
  </div>
</div>

<style>
.panel-container {
  display: grid;
  grid-template: 1fr 1fr / 1fr 1fr;
  grid-auto-flow: column;
}

.panel {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 1px 1px 5px #000;
  border-radius: 1em;
  margin: 1em;
  display: grid;
  flex-direction: column;
  gap: 0.5em;
  grid-template-rows: 32px;
  padding: 1.5em;
}

h2 {
  margin: 0;
}

audio {
  width: 100%;
}


label {
    display: grid;
  }
</style>