<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import type DTOCalificacion from "$lib/dtos/usuarios/DTOCalificacion";
	import { onMount, tick } from "svelte";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { HttpError } from "$lib/request/request";
	import PopupError from "./PopupError.svelte";
	import type DTOTipoCalificacion from "$lib/dtos/usuarios/DTOTipoCalificacion";
	import TextField from "./TextField.svelte";

    export let visible : boolean;
    export let username : string | null;

    $: confirmarVisible = false;

    let califTipoNombre = "";

    let data : DTOCalificacion = {
		calificacionTipo: null,
		usuarioCalificado: "",
		motivos: [],
		descripcion: ""
	}

    $: calificacionTipos = [] as {id: number, nombre: string}[]

    $: error = ""
	$: errorVisible = false;
    $: popupExitoVisible = false;

    $: (async () => {
        if (username === null) return;
        data.usuarioCalificado = username;
        
        calificacionTipos = await UsuariosService.obtenerCalificacionTiposPara(username)
    })()

    

    onMount(async() => {
        try {
            let calificacionesAux : DTOTipoCalificacion[] = await UsuariosService.obtenerTiposYMotivosCalificacion();

            calificacionesAux.forEach(async cal => {
                let img = await UsuariosService.obtenerImagenDeCalificacion(cal.nombre);
                
                calificaciones.push({
                    self: cal,
					nombre: cal.nombre,
					imgUrl: img
				})
                calificaciones = [...calificaciones]
            })
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}    
		}
    })

    let calificaciones : {self: DTOTipoCalificacion, nombre: string, imgUrl: string}[] = [];
    
    let title : string = "Calificar usuario";

    $: title = califTipoNombre !== "Denuncia" ? "Calificar usuario" : "Denunciar usuario";

    $: califSelec = null as DTOTipoCalificacion | null;    

    function cerrar() {
        confirmarVisible = false;
        visible = false;
        data = {
		    calificacionTipo: null,
            usuarioCalificado: "",
            motivos: [],
            descripcion: ""
        }
        califTipoNombre = "";
        califSelec = null;
        calificacionTipos = [];
        username = null;
    }

    async function confirmar() {
        if (username === null) {
            error = "No se seleccionó al usuario";
			errorVisible = true;
            return;
        }

        try {
            await UsuariosService.calificarUsuario(data);
            popupExitoVisible = true;
        } catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}    
            console.log(e);
            
		}

        cerrar();
        
    }

    function changeCalif(cal: DTOTipoCalificacion) {
        if (califSelec === cal) return;
        califSelec = cal;
        data.motivos = [];
        confirmarVisible = false;
    }

    function toggleMotivo(id: number) {
        if (data.motivos.includes(id)) {
            let ix = data.motivos.indexOf(id);
            data.motivos.splice(ix, 1);
        } else {
            data.motivos.push(id);
        }

        if (data.motivos.length > 0) {    
            confirmarVisible = true;
        } else {
            confirmarVisible = false;
        }

        data = {...data};
    }

    function validateDescripcion(val: string) {
        if (val.trim() === "") {
            return {
                valid: false,
                reason: "Debe ingresar una descripción del cambio de estado"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }

    $: (()=>{
        if (califTipoNombre !== "Denuncia") return;
        if (data.descripcion.trim().length > 0) {
            confirmarVisible = true
        } else {
            confirmarVisible = false;
        }
    })()

</script>

<Popup bind:title={title} bind:visible={visible} fitH>

    <div class="h-full grow">
        {#if data.calificacionTipo === null}
        <div class="flex flex-col gap-2 justify-center items-center h-full">
            {#each calificacionTipos as cal}
                <Button action={()=>{data.calificacionTipo = cal.id; califTipoNombre = cal.nombre}}>{cal.nombre}</Button>
            {/each}
        </div>
        {:else}
            {#if califTipoNombre === "Calificación Normal"}
                <div class="flex flex-col {califSelec !== null ? "justify-start" : "justify-center"} items-center h-full">
                    <div class="w-full flex flex-wrap gap-2 justify-center items-center {califSelec !== null ? "" : "h-full"}">
                        {#each calificaciones as cal}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="w-[25vw] sm:w-[120px] h-fit flex flex-col justify-center items-center cursor-pointer" on:click={() => changeCalif(cal.self)}>
                            <img src={cal.imgUrl} alt={cal.nombre} class="object-contain">
                        </div>
                        {/each}
                    </div>

                    {#if califSelec !== null}
                        <div class="w-full flex flex-col gap-2 mt-8 sm:flex-row sm:flex-wrap sm:gap-16 sm:justify-center">
                            {#each califSelec.motivos as mot}
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div class="flex gap-2 cursor-pointer hover:text-dark" on:click={() => toggleMotivo(mot.id)}>
                                    <span>{mot.nombre}</span>
                                    {#if data.motivos.includes(mot.id)}
                                        <span class="checkContainer">
                                            <img src={"/icons/check.png"} alt="Ícono" class="object-contain">
                                        </span>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>

                
            {:else if califTipoNombre === "Denuncia"}
                <TextField label="Descripción de la denuncia" multiline bind:value={data.descripcion} validate={validateDescripcion} rows={6} min={1} max={1000}/>
            {/if}
        {/if}
    </div>
    
    
    <div class="flex justify-center items-center w-full gap-2 mt-8">
        <Button action={cerrar}>Cancelar</Button>
        {#if confirmarVisible}
            <Button action={confirmar}>Confirmar</Button>
        {/if}
    </div>
</Popup>


<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Calificación guardada
    <div class="flex justify-center items-center w-full">
        <Button action={() => {popupExitoVisible = false;}}>Aceptar</Button>
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