<script lang="ts">
    export let title : string | undefined = "";

    export let visible : boolean = false;

    export let fitW : boolean = false;
    export let fitH : boolean = false;
    
    export let classes : string = ""
</script>

{#if visible}
    <div id="bg" class="{classes} fixed top-0 left-0 bottom-0 right-0 bg-dark flex items-center justify-center p-4">
        <div id="popup" class="bg-white rounded-lg p-4 w-{fitW ? "fit" : "full"} h-{fitH ? "fit" : "full"} flex flex-col">
            <h1 class="text-m text-center">{title}</h1>
            <slot/>
        </div>
    </div>
{/if}

<style>
    #bg {
        background-color: #1D4E89b0;
        z-index: 15;
    }

    #popup {
        opacity: 1;
    }
</style>