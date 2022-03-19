<script lang="ts">
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'

  let tabCount = -1
  let conetentCount = -1

  const currentTab = writable(0)
  setContext('tabs', {
    currentTab,
    registerTab() {
      tabCount += 1
      return tabCount
    },
    registerContent() {
      conetentCount += 1
      return conetentCount
    },
    selectTab(index: number) {
      currentTab.update(() => index)
    },
  })
</script>

<slot />
