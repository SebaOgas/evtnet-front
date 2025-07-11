<script lang="ts">
	import PopupSeleccion from "./PopupSeleccion.svelte";

    export let placeholder: string = "";

    let shown = false;

    function toggleShown() {
        shown = !shown;
    }

    export let maxHeight : number = 4;

    export let options : Map<number, string> = new Map<number, string>();

    export let selected : number | undefined = undefined;
    $: selectedText = "";
    
    $: selOptPopup = new Map<number, string>();

    function select(val: number, txt: string) {
        selected = val;
        selectedText = txt;
        selOptPopup.clear();
        selOptPopup.set(val, txt);
        selOptPopup = new Map(selOptPopup);
    }

    async function searchPopup(val: string) {
        return options;
    }

    $: (() => {
        let entry = selOptPopup.entries().next().value;
        if (entry !== undefined) 
            select(entry[0], entry[1]);
    })();

</script>


<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="combobox bg-white text-black border border-black rounded-sm w-full" on:click={toggleShown}>
    <div class="value w-full">
        {#if selected === undefined}
            <span class="ph p-1 text-dark">{placeholder}</span>
        {:else}
            <span class="p-1">{selectedText}</span>
        {/if}
        {#if shown}
            <div class="options flex bg-white border border-black rounded overflow-auto" style="max-height:calc({maxHeight} * 24px)">
                {#each options as opt}
                    <span on:click={() => {select(opt[0], opt[1])}}>
                        {opt[1]}
                    </span>
                {/each}
            </div>
            <div class="popup">
                <PopupSeleccion title={placeholder} multiple={false} noSearch={true} visible={shown} searchFunction={searchPopup} bind:selected={selOptPopup} fitH fitW/>
            </div>
        {/if}
    </div>
    <img src="icons/comboboxarrow.svg" alt="Desplegar" style="{shown ? "transform: rotate(-90deg)" : ""}" />
</div>



<style>
    .combobox ::selection, .combobox :global(::selection) {
        background-color: inherit;
        color: inherit;
    }

    .combobox {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;
        cursor: default;
        user-select: none;
    }

    .value {
        height: 24px;
    }

    img {
        height: 27px;
        width: 27px;
        widows: 20px;
        transition: transform 500ms;
    }

    .options {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: stretch;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
    }

    .options>span {
        padding-left: 4px;
    }



    .options :global(:hover) {
        background-color: var(--color-dark);
        color: var(--color-white);
    }

    @media screen and (width >= 40rem) {
        .popup {
            display: none;
        }
    }
    @media screen and (width < 40rem) {
        .options {
            display: none;
        }
    }
</style>