<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import SearchField from "./SearchField.svelte";
	import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";
	import { UsuariosService } from "$lib/services/UsuariosService";

    export let searchFunction : (val: string) => Promise<DTOBusquedaUsuario[]>;

    export let visible : boolean = false;
    
    export let fitW : boolean = false;
    export let fitH : boolean = false;
    
    export let classes : string = ""

    export let selected : DTOBusquedaUsuario | null = null;

    $: found = [] as DTOBusquedaUsuario[];

    $: selectedCopy = null as DTOBusquedaUsuario | null;

    function closePopup() {
        visible = false;
        selectedCopy = {...selected} as DTOBusquedaUsuario | null;
        found = [];
    }

    function accept() {
        visible = false;
        found = [];
        selected = {...selectedCopy} as DTOBusquedaUsuario | null;
    }

    async function toggleItem(event: Event, val: DTOBusquedaUsuario) {        
        if ((event.target as Element).tagName === "BUTTON") return;
        if (selectedCopy === val) {
            selectedCopy = null;
        } else {
            selectedCopy = val;
        }
    }

    function loadFotoDePerfil(img: HTMLImageElement, username: string) {	
		(async () => {
			img.src = await UsuariosService.obtenerFotoDePerfil(username);
			img.style.display = "block";
            img.dataset.username = username;
		})()	
    }    

    function filter(val: string, method: string) {
        let len = val.replaceAll(/\s*/g, "").length;

        if (method === "auto" && len >= 4) return true;

        if (method === "manual" && len >= 1) return true;

        return false;
    }

    $: srcFotoDePerfilSeleccionada = "";
    $: popupFotoDePerfilVisible = false;

    function verFotoDePerfil(username: string | undefined) {
        if (popupFotoDePerfilVisible === true) return;
        if (username === undefined) return;
        let elem = (document.querySelector(`img[data-username="${username}"]`) as HTMLImageElement);
        if (elem === null) {
            setTimeout(() => {
                verFotoDePerfil(username);
            }, 500);
            return;
        }
        srcFotoDePerfilSeleccionada = elem.src;
        popupFotoDePerfilVisible = true;
    }
</script>



<Popup bind:visible title="Buscar usuario" {fitW} {fitH} {classes}>
    <SearchField searchFunction={searchFunction} bind:results={found} searchFilter={filter} autoSearch/>
    <div class="grow overflow-y-auto flex flex-col mt-2">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#each found as f}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="p-2 gap-2 item flex flex-col shrink cursor-pointer {selectedCopy?.username === f.username ? "bg-light text-white rounded-sm" : "hover:text-dark"}"  on:click={(event) => {toggleItem(event, f)}}>
                <div class="flex items-center gap-2">
                    <img use:loadFotoDePerfil={f.username} alt="Foto de perfil" class="h-[40px] w-[40px] rounded-full object-cover cursor-pointer hidden">
                    <div>{f.nombre} {f.apellido}</div>
                    {#if selectedCopy?.username === f.username}
                        <span class="checkContainer">
                            <img src={"/icons/check.png"} alt="Ícono" class="object-contain">
                        </span>
                    {/if}
                </div>
                {#if selectedCopy?.username === f.username}
                    <div>@{f.username}</div>
                    {#if selectedCopy?.dni !== null}
                        <div class="flex justify-between items-center">
                            <span>DNI:</span>
                            <span>{selectedCopy?.dni}</span>
                        </div>
                    {/if}
                    {#if selectedCopy?.mail !== null}
                        <div class="flex justify-between items-center">
                            <span>mail:</span>
                            <span>{selectedCopy?.mail}</span>
                        </div>
                    {/if}
                    {#if selectedCopy?.fechaNacimiento !== null}
                        <div class="flex justify-between items-center">
                            <span>Nacimiento:</span>
                            <span>{selectedCopy?.fechaNacimiento}</span>
                        </div>
                    {/if}
                    <div class="w-full flex justify-center">
                        <Button classes="!bg-dark text-white text-xs" action={() => {verFotoDePerfil(selectedCopy?.username)}}>Ver foto de perfil</Button>
                    </div>
                {/if}
            </div>
            
        {/each}
    </div>
    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={closePopup}>Cancelar</Button>
        <Button action={accept} disabled={selectedCopy === null || selectedCopy.username === undefined}>Aceptar</Button>
    </div>
</Popup>

<Popup bind:visible={popupFotoDePerfilVisible} title="Foto de Perfil" fitW fitH>
    <div class="w-full md:w-fit md:h-[50vh] mb-2">
        <img src={srcFotoDePerfilSeleccionada} alt="Foto de perfil" class="md:object-contain md:w-full md:h-full">
    </div>
    <div class="w-full flex justify-center"><Button action={() => {popupFotoDePerfilVisible = false}}>Cerrar</Button></div>
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