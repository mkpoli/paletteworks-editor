<script lang="ts">
  import { getContext } from 'svelte'

  const { currentTab, registerContent } = getContext('tabs')

  const tabIndex = registerContent()
</script>

<div class="tab-content" class:hidden={$currentTab !== tabIndex}>
  <slot></slot>
</div>

<style>
  .tab-content.hidden {
    display: none;
  }
</style>