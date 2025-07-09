<script lang="ts">
    export let text : string = "Advertencia"
    export let visible : boolean = false
</script>

<div id="warning" class="items-center" style="display:{visible?"flex":"none"}">
    <img src="icons/warning.svg" alt="!">
    <span class="text-orange font-bold text-xs">{text}</span>
</div>

<style>
    #warning {
        height: 27px;
    }
</style>