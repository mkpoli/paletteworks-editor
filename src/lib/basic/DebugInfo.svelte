<script lang="ts">
  export let debugInfo = new Map<string, string | number>()
</script>

<div class="debug-display">
  {#each [...debugInfo.entries()] as [title, value] }
    <span class="title">{title}</span>
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
    
  }

  .debug-display > .title {
    color: #222;
    font-weight: 800;
  }
</style>