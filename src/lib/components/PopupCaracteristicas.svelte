<script lang="ts">
    import Popup from "./Popup.svelte";
    import Button from "./Button.svelte";

    // Recibe la lista de iconos: {id, url}
    export let iconos: {id: number, url: string}[] = [];
    export let title: string | undefined = "";
    export let visible: boolean = false;
    export let fitW: boolean = false;
    export let fitH: boolean = false;
    export let classes: string = "";
    export let selectedId: number | null = null; // bind:selectedId desde el padre

    function closePopup() {
        visible = false;
    }

    function accept() {
        visible = false;
        // El id seleccionado queda en selectedId (bind:selectedId)
    }

    function selectIcon(id: number) {
        selectedId = id;
    }
</script>

<Popup bind:visible bind:title {fitW} {fitH} {classes}>
    <div class="grow overflow-y-auto flex flex-col items-center">
        <div class="grid grid-cols-4 gap-4 mt-4">
            {#each iconos as icono}
                <div class="icono-item flex items-center justify-center cursor-pointer rounded-5 border-2 {selectedId === icono.id ? 'border-cyan-500 bg-cyan-100' : 'border-transparent'}"
                    on:click={() => selectIcon(icono.id)}>
                    <img src={icono.url} alt="Ícono" class="flex" />
                </div>
            {/each}
        </div>
    </div>
    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={closePopup}>Cancelar</Button>
        <Button action={accept} disabled={selectedId === null}>Aceptar</Button>
    </div>
</Popup>

<style>
    .icono-item {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border 0.2s, background 0.2s;
    }
    .icono-item:hover {
        border-color: #06b6d4;
        background: #e0f7fa;
    }
</style>