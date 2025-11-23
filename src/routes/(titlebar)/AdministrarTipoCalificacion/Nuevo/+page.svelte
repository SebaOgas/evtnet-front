<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { HttpError } from "$lib/request/request";
	import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import { onMount } from "svelte";
	import Popup from "$lib/components/Popup.svelte";
	import { CalificacionService } from "$lib/services/CalificacionService";
	import type DTOAltaTipoCalificacion from "$lib/dtos/tipoCalificacion/DTOAltaTipoCalificacion";
	import FilePicker, { getImageFileDimensions } from "$lib/components/FilePicker.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import TextField from "$lib/components/TextField.svelte";

	$: errorPermiso = false;
	$: errorVisible = false;
	$: error = "";
    $: exitoVisible = false;

	$: errorTamanoImagenIconoVisible = false;
	$: errorTamanoImagenIcono = "";

	$: data = {
		url: "",
		nombre:""
	} as DTOAltaTipoCalificacion;

	let icono: File | null = null;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionMediosPago")) {
			errorPermiso = true;
			return;
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
		validateNombre(data.nombre).valid &&
		data.url.trim().length > 0
	);

	function validateImagenIcono(file: File | null, preventRequest = false) {
        if (!preventRequest) {
            
            (async () => {
                if (file === null) {
                    errorTamanoImagenIconoVisible = false;
                    errorTamanoImagenIcono = "";
                    return
                }

                let dims = await getImageFileDimensions(file);               

                /* if (dims.h !== dims.w) {
                    errorTamanoImagenIconoVisible = true;
                    errorTamanoImagenIcono = "La foto del ícono debe ser cuadrada"
					completado=false;
                    return
                } */

                if (dims.h < 10) {
                    errorTamanoImagenIconoVisible = true;
                    errorTamanoImagenIcono = "La foto del ícono debe ser más grande (mayor a 10px de ancho y alto)"
					completado=false;
                    return
                }
                errorTamanoImagenIconoVisible = false;
                errorTamanoImagenIcono = "";
        
            })();
        }

        if (file === null) {
            return {
                valid: true,
                reason: undefined
            }
        }
        cargarImagen();
        return {
            valid: true,
            reason: undefined
        }
    }

	async function cargarImagen() {
		if (icono === null) {
			data.url = "";
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				data.url = reader.result;
			}
		};
		reader.readAsDataURL(icono);
	}


	async function guardar() {
		
		
		try {
			await CalificacionService.altaTipoCalificacion(data);
            exitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	}

	function cancelar() {
		goto("/AdministrarTipoCalificacion");
	}

	let minDate = new Date();
	minDate.setFullYear(minDate.getFullYear() - 100);

	let maxDate = new Date();
	maxDate.setFullYear(maxDate.getFullYear() - 18);
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow md:grow-0">
		<h1 class="text-m text-center md:text-start">Alta de Tipo de Calificación</h1>
		
        <div class="flex flex-col gap-2 overflow-y-auto grow w-full md:max-w-[1000px]">
            <TextField 
                label="Nombre" 
                bind:value={data.nombre} 
                classes="w-full" 
                validate={validateNombre}
                forceValidate
                max={50}
            />
			{#if data.url !== ""}
				<div class="flex">
					<img src="{data.url}" alt="Ícono" class="w-12 h-12" />
				</div>	
			{/if}	
			<FilePicker
				label=""
				bind:file={icono}
				accept={[".svg", ".png"]}
				validate={validateImagenIcono}
				classes="flex"
				buttonText="Seleccionar imagen"
				showFileName={false}
			/>
			<Warning text={errorTamanoImagenIcono} visible={errorTamanoImagenIconoVisible}/>
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
	No tiene permiso para dar de alta tipos de calificación.
</PopupError>

<Popup bind:visible={exitoVisible} fitH fitW>
	<span>
        Tipo de calificación añadido exitosamente. 
    </span>
    <div class="flex w-full justify-center">
        <Button action={() => goto("/AdministrarTipoCalificacion")}>Aceptar</Button>
    </div>
</Popup>