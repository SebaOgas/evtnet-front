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
	import type DTOAltaMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOAltaMotivoCalificacion";
	import { CalificacionService } from "$lib/services/CalificacionService";
	import ComboBox from "$lib/components/ComboBox.svelte";

	$: errorPermiso = false;
	$: errorVisible = false;
	$: error = "";
    $: exitoVisible = false;

	$: data = {
		nombre: "",
		idTipoCalificacion: 0
	} as DTOAltaMotivoCalificacion;

	let tiposCalificacion : Map<string, string> = new Map();
	let tiposCalificacionArray: {id: number, nombre: string}[] = [];
	let tipoCalificacionSeleccionado:string | null = null;

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
			tiposCalificacionArray = await CalificacionService.obtenerTiposCalificacion();
			tiposCalificacionArray.forEach(tc => {
				tiposCalificacion.set(tc.id.toString(), tc.nombre);
			});
		}catch(e){
			if(e instanceof HttpError){
				error = e.message;
				errorVisible = true;
			}
		}
		
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
			data.idTipoCalificacion = tipoCalificacionSeleccionado ? tipoCalificacionSeleccionado : 0;
			await CalificacionService.altaMotivoCalificacion(data);
            exitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	}

	function cancelar() {
		goto("/AdministrarMotivoCalificacion");
	}

	let minDate = new Date();
	minDate.setFullYear(minDate.getFullYear() - 100);

	let maxDate = new Date();
	maxDate.setFullYear(maxDate.getFullYear() - 18);
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2  grow md:grow-0">
		<h1 class="text-m text-center md:text-start">Alta de Motivo de Calificación</h1>
		
        <div class="flex flex-col gap-2 grow w-full md:max-w-[1000px]">
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
	No tiene permiso para dar de alta motivos de calificación.
</PopupError>

<Popup bind:visible={exitoVisible} fitH fitW>
	<span>
        Motivo de calificación añadido exitosamente.
    </span>
    <div class="flex w-full justify-center">
        <Button action={() => goto("/AdministrarMotivoCalificacion")}>Aceptar</Button>
    </div>
</Popup>