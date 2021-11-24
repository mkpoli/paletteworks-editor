<script lang="ts">
  export let menu: HTMLDivElement
</script>

<slot name="trigger"></slot>
<div class="menu-container" style={$$props.style} bind:this={menu}>
  <slot></slot>
</div>

<style>
  .menu-container {
    padding: 0.25em 0;

    background: #434758;
    border-radius: 0.4em;
    box-shadow: 2px 2px 4px 0 #000;

    overflow: hidden;
  }
</style>