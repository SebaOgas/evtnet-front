<script lang="ts">
    export let text : string = "Advertencia"
    export let visible : boolean = false
    export let maxWidth : string = "100%"
    export let classes : string = ""
</script>

{#if visible}
    <div id="warning" class="{classes} flex items-center w-fit">
        <img src="/icons/warning.svg" alt="!">
        <div class="text-orange font-bold text-xs w-fit" style="max-width:{maxWidth}">{text}</div>
    </div>
{/if}

<style>
    #warning {
        min-height: 27px;
    }
</style>