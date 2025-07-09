<script lang="ts">
    export let text : string = "Advertencia"
    export let visible : boolean = false
    export let maxWidth : string = "100%"
</script>

<div id="warning" class="items-center w-fit" style="display:{visible?"flex":"none"}">
    <img src="icons/warning.svg" alt="!">
    <div class="text-orange font-bold text-xs w-fit" style="max-width:{maxWidth}">{text}</div>
</div>

<style>
    #warning {
        height: 27px;
    }
</style>