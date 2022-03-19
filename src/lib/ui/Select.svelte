<script lang="ts">
  export let value: string
  export let options: readonly [string, string][]
  export let name: string
</script>

<select bind:value {name}>
  {#each [...options] as [v, text]}
    <option value={v}>{text}</option>
  {/each}
</select>

<style>
  select {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.6);
    padding: var(--input-padding);
    color: inherit;
    border: none;
    border-radius: var(--input-border-radius);
  }

  option {
    background: #555965;
  }
</style>
