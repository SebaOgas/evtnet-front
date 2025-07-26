<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import SearchField from "./SearchField.svelte";
	import { onMount } from "svelte";

    export let searchFunction : (val: string) => Promise<Map<number, string>>;

    export let title : string | undefined = "";

    export let visible : boolean = false;
    
    export let fitW : boolean = false;
    export let fitH : boolean = false;
    
    export let classes : string = ""

    export let selected : Map<number, string> = new Map<number, string>();

    export let multiple : boolean = true;

    export let noSearch : boolean = false;

    $: found = new Map<number, string>()

    $: selectedCopy = new Map(selected);

    function closePopup() {
        visible = false;
        selectedCopy = new Map(selected);
        if (!noSearch)
            found = new Map<number, string>();
    }

    function accept() {
        visible = false;
        if (!noSearch)
            found = new Map<number, string>();
        selected = new Map(selectedCopy);
    }

    async function toggleItem(num: number, val: string) {
        if (multiple) {
            if (selectedCopy.has(num)) {
                selectedCopy.delete(num);
            } else {
                selectedCopy.set(num, val);
            }
            selectedCopy = new Map(selectedCopy);
        } else {
            selectedCopy = new Map();
            selectedCopy.set(num, val);
            accept();
        }
        
    }

    onMount(async () => {
        if (noSearch) {
            found = await searchFunction("");
        }
    })
</script>



<Popup bind:visible bind:title {fitW} {fitH} {classes}>
    {#if !noSearch}
        <SearchField disabled={noSearch} searchFunction={searchFunction} bind:results={found}/>
    {/if}
    <div class="grow overflow-y-auto">
        {#if found.size > 0}
            <div class="flex flex-col mt-2">
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                {#each found as f}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div class="item flex shrink gap-2 cursor-pointer hover:text-dark" on:click={() => {toggleItem(f[0], f[1])}}>
                        <span data-value={f[0]}>{f[1]}</span>
                        {#if selectedCopy.has(f[0])}
                            <span class="checkContainer">
                                <img src={"icons/check.png"} alt="Ícono" class="object-contain">
                            </span>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
        {#if selectedCopy.size > 0 && !noSearch}
            <p class="mt-2">Otros seleccionados:</p>
            <div class="flex flex-col mt-2">
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                {#each selectedCopy as s}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    {#if !found.has(s[0])}
                    <div class="item flex shrink gap-2 cursor-pointer hover:text-dark" on:click={() => {toggleItem(s[0], s[1])}}>
                        <span data-value={s[0]}>{s[1]}</span>
                        <span class="checkContainer">
                            <img src={"icons/check.png"} alt="Ícono" class="object-contain">
                        </span>
                    </div>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={closePopup}>Cancelar</Button>
        <Button action={accept}>Aceptar</Button>
    </div>
</Popup>


<style>
    .checkContainer {
        height: 23px;
        width: 23px;
        position: relative;
        overflow: hidden;
    }

    .checkContainer img {
        filter: drop-shadow(-100vw 0 0 var(--color-light));
        transform: translateX(100vw);
        user-select: none;
    }
</style>