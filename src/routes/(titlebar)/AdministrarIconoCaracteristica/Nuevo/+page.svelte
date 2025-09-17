<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { HttpError } from "$lib/request/request";
	import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import { onMount } from "svelte";
	import Popup from "$lib/components/Popup.svelte";
	import { IconosCaracteristicasService } from "$lib/services/IconosCaracteristicasService";
	import type DTOAltaIconoCaracteristica from "$lib/dtos/iconoscaracteristicas/DTOAltaIconoCaracteristica";
	import FilePicker, { getImageFileDimensions } from "$lib/components/FilePicker.svelte";

	$: errorPermiso = false;
	$: errorVisible = false;
	$: error = "";
    $: exitoVisible = false;

	$: errorTamanoImagenIconoVisible = false;
	$: errorTamanoImagenIcono = "";

	$: data = {
		url: ""
	} as DTOAltaIconoCaracteristica;

	let icono: File | null = null;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionIconosCaracteristicas")) {
			errorPermiso = true;
			return;
		}

		
	});

	
	
	$: completado = (
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

                if (dims.h !== dims.w) {
                    errorTamanoImagenIconoVisible = true;
                    errorTamanoImagenIcono = "La foto del ícono debe ser cuadrada"
                    return
                }

                if (dims.h < 10) {
                    errorTamanoImagenIconoVisible = true;
                    errorTamanoImagenIcono = "La foto del ícono debe ser más grande (mayor a 10px de ancho y alto)"
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
        guardar();
        return {
            valid: true,
            reason: undefined
        }
    }


	async function guardar() {
		
		
		try {
			await IconosCaracteristicasService.altaIconoCaracteristica(data);
            exitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	}

	function cancelar() {
		goto("/AdministrarIconoCaracteristica");
	}

	let minDate = new Date();
	minDate.setFullYear(minDate.getFullYear() - 100);

	let maxDate = new Date();
	maxDate.setFullYear(maxDate.getFullYear() - 18);
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow md:grow-0">
		<h1 class="text-m text-center md:text-start">Alta de Ícono Característica</h1>
		
        <div class="flex flex-col gap-2 overflow-y-auto grow w-full md:max-w-[1000px]">
            <FilePicker
				label=""
				bind:file={icono}
				accept={[".jpg", ".svg", ".png"]}
				validate={validateImagenIcono}
				classes="flex justify-center"
				buttonText="Seleccionar imagen"
				showFileName={false}
			/>
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
	No tiene permiso para dar de alta iconos de característica.
</PopupError>

<Popup bind:visible={exitoVisible} fitH fitW>
	<span>
        Icono de característica añadido exitosamente. 
    </span>
    <div class="flex w-full justify-center">
        <Button action={() => goto("/AdministrarIconoCaracteristica")}>Aceptar</Button>
    </div>
</Popup>