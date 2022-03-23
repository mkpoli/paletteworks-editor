<script lang="ts">
  export let name: string
  export let value: boolean
  $: id = `checkbox-${name}`
</script>

<input
  type="checkbox"
  {id}
  {name}
  bind:checked={value}
/>
<label
  for={id}
>
  <slot />
</label>
