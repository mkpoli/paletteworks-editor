<script lang="ts">
  import TextInput from "$lib/ui/TextInput.svelte"
  import Button from "./Button.svelte"
  import Icon from '@iconify/svelte'

  export let file: File | null
  export let accept: string
  export let name: string
  export let openIcon: string
  export let text: string
  export let fileIcon: string
  export let loading: boolean

  let fileList: FileList

  $: file = fileList?.[0] ?? null

  let input: HTMLInputElement

  $: if (input && file !== fileList?.[0]) {
    input.value = ''
  }

  $: accepts = accept.split(',').map(a => a.trim())

  function onclick() {
    input.click()
  }
</script>

<input type="file" bind:files={fileList} {accept} {name} bind:this={input}>

<div
  class="file-container"
  on:dragover|preventDefault|capture={() => {}}
  on:drop|preventDefault|capture={(event) => {
    if (!event.dataTransfer || event.dataTransfer.items.length === 0) return
    const item = event.dataTransfer.items[0]
    if (item.kind !== 'file') return
    let droppedFile = item.getAsFile()
    if (!droppedFile) return
    event.stopPropagation()
    if (accepts.some((accept) => droppedFile && (droppedFile.type.match(accept) || droppedFile.name.match(accept)))) {
      file = droppedFile
    }
  }}
>
  {#if file}
    <TextInput value={file.name} disabled>
      <div slot="head">
        <Icon icon={fileIcon} />
      </div>
      <Button {loading} class="action" slot="tail" icon={openIcon} on:click={onclick}></Button>
    </TextInput>
  {:else}
    <Button {loading} icon={openIcon} on:click={onclick} style="width: 100%;">{text}</Button>
  {/if}
</div>

<style>
  input {
    display: none;
  }

  input::-webkit-file-upload-button {
    color: white;
  }

  .file-container {
    display: flex;
  }
  .file-container > :global(*) {
    margin: 0;
  }
</style>