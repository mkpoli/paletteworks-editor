<script lang="ts">
  import type { DebugInfo } from '$lib/basic/debug'
  import { debugInfo } from '$lib/basic/debug'

  let info: DebugInfo

  debugInfo.subscribe((debugInfo) => { info = debugInfo })

  new Map<string, string | number>()
  let hidden: boolean = false
</script>

<div class="debug-display" class:hidden on:dblclick={() => { hidden = true }}>
  {#each [...info.entries()] as [title, value] }
    <span class="title" title={title}>{title}</span>
    <span class="value">{value}</span>
  {/each}
</div>

<style>
  .debug-display {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1em 1.5em;
    color: black;
    font-size: 0.9em;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    box-shadow: 1px 1px 3px #000a;
    border-bottom-left-radius: 1em;
    display: grid;
    grid-template-columns: auto 1fr;
    width: 30em;
    gap: 0 1em;
    white-space: pre;
  }

  .debug-display > .title {
    color: #222;
    font-weight: 800;
    max-width: 10em;
    overflow: hidden;
  }

  .hidden {
    display: none;
  }
</style>