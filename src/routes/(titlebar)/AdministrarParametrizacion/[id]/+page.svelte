<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { HttpError } from "$lib/request/request";
	import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import { onMount } from "svelte";
	import Popup from "$lib/components/Popup.svelte";
	import { page } from "$app/state";
	import type DTOModificarMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOModificarMotivoCalificacion.ts";
	import type DTOMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOMotivoCalificacion";
	import { CalificacionService } from "$lib/services/CalificacionService";
	import ComboBox from "$lib/components/ComboBox.svelte";

	$: errorPermiso = false;
	$: errorVisible = false;
	$: error = "";
    $: exitoVisible = false;
	
	$: id = parseInt(page.params.id === undefined ? "0" : page.params.id);

	$: data = {
		id: id,
		nombre: "",
		idTipoCalificacion: 0,
	} as DTOModificarMotivoCalificacion;

	let original : DTOMotivoCalificacion = {
		id: id,
		nombre: "",
		idTipoCalificacion: 0,
		nombreTipoCalificacion: ""
	};

	let listo = false;

	let tiposCalificacion : Map<string, string> = new Map();
	let tiposCalificacionArray: {id: number, nombre: string}[] = [];
	let tipoCalificacionSeleccionado: {id: number, nombre: string} | null = null;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionMotivoCalificacion")) {
			errorPermiso = true;
			return;
		}

		try{
            original = await CalificacionService.obtenerMotivoCalificacionCompleto(id);
			tiposCalificacionArray = await CalificacionService.obtenerTiposCalificacion();
			tiposCalificacionArray.forEach(tc => {
				tiposCalificacion.set(tc.id.toString(), tc.nombre);
			});
            data.id = original.id;
            data.nombre = original.nombre;
            data.idTipoCalificacion = original.idTipoCalificacion;
        }catch(e){
            if(e instanceof HttpError){
                error = e.message;
                errorVisible = true;
            }
        }
		listo = true;
	});

	function validateNombre(nombre: string) {
		nombre = nombre.trim();
		if (nombre.length === 0) {
			return {
				valid: false,
				reason: "Es obligatorio ingresar el nombre"
			};
		}
		if (nombre.length > 50) {
			return {
				valid: false,
				reason: "Máximo 50 caracteres"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	
	$: completado = (
		validateNombre(data.nombre).valid
	);

	async function guardar() {
		
		try {
			await CalificacionService.modificarMotivoCalificacion(data);
            exitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	}

	function cancelar() {
		goto("/AdministrarParametrizacion");
	}
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow md:grow-0">
		<h1 class="text-m text-center md:text-start">Modificar Motivo de Calificación</h1>

		{#if listo}
        <div class="flex flex-col gap-2 overflow-y-auto grow w-full md:max-w-[1000px]">
            <TextField 
                label="Nombre" 
                bind:value={data.nombre} 
                classes="w-full" 
                validate={validateNombre}
                forceValidate
                max={50}
            />

            <ComboBox options={tiposCalificacion} bind:selected={tipoCalificacionSeleccionado} placeholder="Seleccionar tipo de calificación" maxHeight={6}/>
        </div>
		{/if}
    </div>
        

	<div class="flex gap-2 h-fit p-2 justify-center items-center md:justify-start">
		<Button classes="text-m" action={cancelar}>Cancelar</Button>
		<Button classes="text-m" action={guardar} disabled={!completado}>Guardar</Button>
	</div>
</div>


<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para modificar Parámetros.
</PopupError>

<Popup bind:visible={exitoVisible} fitH fitW>
	<span>
        Parámetro modificado exitosamente.
    </span>
    <div class="flex w-full justify-center">
        <Button action={() => goto("/AdministrarParametrizacion")}>Aceptar</Button>
    </div>
</Popup>