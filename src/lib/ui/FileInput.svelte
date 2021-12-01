<script lang='ts'>
  import TextInput from '$lib/ui/TextInput.svelte'
  import Button from './Button.svelte'
  import Icon from '@iconify/svelte'

  import toast from '$lib/ui/toast'
  import { dropHandler } from '$lib/basic/file'

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

  function onclick() {
    input.click()
  }
</script>

<input type="file" bind:files={fileList} {accept} {name} bind:this={input}>

<div
  class="file-container"
  on:dragover|preventDefault|capture={() => {}}
  on:drop|preventDefault|capture={dropHandler(accept, (dropped) => { file = dropped }, () => { toast.error('未知のファイルタイプ') })}
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