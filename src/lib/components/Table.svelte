<script lang="ts" context="module">
	import TableCell from "./TableCell.svelte";

    export interface Column {
        label: string;
        key: string;
        class?: string; // optional Tailwind classes for the column
    }

    export interface Row {
        [key: string]: string | TableCell;
    }
</script>

<script lang="ts">
  export let columns: Column[] = [];
  export let rows: Row[] = [];
</script>

<!-- Desktop table -->
<div class="hidden md:block overflow-x-auto">
  <table class="min-w-full">
    <thead>
      <tr>
        {#each columns as col}
          <th class="px-4 py-2 text-left {col.class}">{col.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          {#each columns as col}
            <td class="px-4 py-2 {col.class}">
              {#if typeof row[col.key] === 'string'}
                    {row[col.key]}
              {:else}
                    {@html (()=>{let aux = row[col.key]; return (typeof aux !== "string" ? aux.$$?.fragment : "")})()   }
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<!-- Mobile list -->
<div class="md:hidden space-y-2">
  {#each rows as row}
    <div class="flex flex-col mb-8">
      {#each columns as col}
        <div class="flex justify-between py-1">
          <span class="font-semibold">{col.label}</span>
          <span>
            {#if typeof row[col.key] === 'string'}
              {row[col.key]}
            {:else}
            {/if}
          </span>
        </div>
      {/each}
    </div>
  {/each}
</div>