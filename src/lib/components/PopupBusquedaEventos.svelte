<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import SearchField from "./SearchField.svelte";
	import type DTOBusquedaEvento from "$lib/dtos/eventos/DTOBusquedaEvento";
	import { formatDate } from "./DatePicker.svelte";

    export let searchFunction : (val: string) => Promise<DTOBusquedaEvento[]>;

    export let visible : boolean = false;
    
    export let fitW : boolean = false;
    export let fitH : boolean = false;
    
    export let classes : string = ""

    export let selected : DTOBusquedaEvento | null = null;

    $: found = [] as DTOBusquedaEvento[];

    $: selectedCopy = null as DTOBusquedaEvento | null;

    function closePopup() {
        visible = false;
        selectedCopy = {...selected} as DTOBusquedaEvento | null;
        found = [];
    }

    function accept() {
        visible = false;
        found = [];
        selected = {...selectedCopy} as DTOBusquedaEvento | null;
        selectedCopy = null;
    }

    async function toggleItem(event: Event, val: DTOBusquedaEvento) {        
        if ((event.target as Element).tagName === "BUTTON") return;
        if (selectedCopy === val) {
            selectedCopy = null;
        } else {
            selectedCopy = val;
        }
    }

    function filter(val: string, method: string) {
        let len = val.replaceAll(/\s*/g, "").length;

        if (method === "auto" && len >= 4) return true;

        if (method === "manual" && len >= 1) return true;

        return false;
    }

</script>



<Popup bind:visible title="Buscar evento" {fitW} {fitH} {classes}>
    <SearchField searchFunction={searchFunction} bind:results={found} searchFilter={filter} autoSearch/>
    <div class="grow overflow-y-auto flex flex-col mt-2">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#each found as f}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="p-2 gap-2 item flex flex-col shrink cursor-pointer {selectedCopy?.id === f.id ? "bg-light text-white rounded-sm" : "hover:text-dark"}"  on:click={(event) => {toggleItem(event, f)}}>
                <div class="flex items-center gap-2">
                    <div>{f.nombre}</div>
                    {#if selectedCopy?.id === f.id}
                        <span class="checkContainer">
                            <img src={"/icons/check.png"} alt="Ícono" class="object-contain">
                        </span>
                    {/if}
                </div>
                {#if selectedCopy?.id === f.id}
                    {#if selectedCopy?.fechaDesde !== null}
                        <span>{formatDate(selectedCopy?.fechaDesde)}</span>
                    {/if}
                    {#if selectedCopy?.nombreEspacio !== null}
                        <span>{selectedCopy?.nombreEspacio}</span>
                    {/if}
                    {#if selectedCopy?.disciplinas !== null}
                        <div class="commaList">
                            {#each selectedCopy.disciplinas as d}
                                <span>{d.nombre}</span>
                            {/each}
                        </div>
                    {/if}
                {/if}
            </div>
            
        {/each}
    </div>
    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={closePopup}>Cancelar</Button>
        <Button action={accept} disabled={selectedCopy === null || selectedCopy.id === undefined}>Aceptar</Button>
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
        filter: drop-shadow(-100vw 0 0 var(--color-white));
        transform: translateX(100vw);
        user-select: none;
    }
</style>