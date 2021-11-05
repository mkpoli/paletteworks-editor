<script lang="ts">
  import { getContext } from 'svelte'

  const { currentTab, registerTab, selectTab } = getContext('tabs')

  const tabIndex = registerTab()
</script>

<button class="tab-item" class:active={$currentTab === tabIndex} on:click={() => { selectTab(tabIndex) }}>
  <slot></slot>
</button>

<style>
  .tab-item {
    position: relative;
  }

  button {
    background: none;
    border: none;
    color: inherit;
  }

  .active::after {
    content: "";
    
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    height: 0.15em;

    pointer-events: none;
    background-color: currentColor;
  }

</style>