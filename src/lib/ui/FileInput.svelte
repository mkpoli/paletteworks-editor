<script lang="ts">
  import TextInput from "$lib/ui/TextInput.svelte"
  import Button from "./Button.svelte"
  import Icon from '@iconify/svelte'

  export let files: FileList
  export let accept: string
  export let name: string
  export let openIcon: string
  export let text: string
  export let fileIcon: string

  let input: HTMLInputElement

  function onclick() {
    input.click()
  }
</script>

<input type="file" bind:files {accept} {name} bind:this={input}>

{#if files?.length}
  <div class="file-container">
    <TextInput value={files?.[0].name} disabled>
      <div slot="head">
        <Icon icon={fileIcon} />
      </div>
      <Button class="action" slot="tail" icon={openIcon} on:click={onclick}></Button>
    </TextInput>
  </div>
  <!-- {files[0]} -->
{:else}
  <Button icon={openIcon} on:click={onclick}>{text}</Button>
{/if}

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