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
	import type DTOAltaComision from "$lib/dtos/comision/DTOAltaComision";
	import { ComisionService } from "$lib/services/ComisionService";
	import DatePicker from "$lib/components/DatePicker.svelte";

	$: errorPermiso = false;
	$: errorVisible = false;
	$: error = "";
    $: exitoVisible = false;

	$: data = {
		montoLimite: 0,
		porcentaje: 0,
		fechaDesde: new Date(),
		fechaHasta: new Date(),
	} as DTOAltaComision;

	let fechaDesde: Date | null = null;
	let fechaHasta: Date | null = null;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionParametros")) {
			errorPermiso = true;
			return;
		}

		
	});

	function validateMontoLimite(monto: number) {
		if (monto <= 0) {
			return {
				valid: false,
				reason: "El monto límite debe ser mayor a 0"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	
	$: completado = (
		validateMontoLimite(data.montoLimite).valid
	);

	async function guardar() {
		
		data.fechaDesde = fechaDesde;
		data.fechaHasta = fechaHasta;
		try {
			await ComisionService.altaComisionInscripcion(data);
            exitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	}

	function cancelar() {
		goto("/AdministrarComisionInscripcion");
	}

	let minDate = new Date();
	minDate.setFullYear(minDate.getFullYear() - 100);

	let maxDate = new Date();
	maxDate.setFullYear(maxDate.getFullYear() - 18);
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2  grow md:grow-0">
		<h1 class="text-m text-center md:text-start">Alta de Comisión por Inscripción</h1>
		
        <div class="flex flex-col gap-2 grow w-full md:max-w-[1000px]">
            <TextField 
                label="Monto Límite" 
                bind:value={data.montoLimite} 
                classes="w-full" 
                max={50}
            />

            <TextField 
                label="Porcentaje" 
                bind:value={data.porcentaje} 
                classes="w-full"
                max={100}
            />

			 <div class="position:relative;z-index:100;">
				<DatePicker minDate={minDate} bind:value={fechaDesde} label="Fecha desde"/>
			</div>
			<div class="position:relative;z-index:100;">
				<DatePicker minDate={minDate} bind:value={fechaHasta} label="Fecha hasta"/>
			</div>

			 
            
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
	No tiene permiso para dar de alta comisiones por inscripción.
</PopupError>

<Popup bind:visible={exitoVisible} fitH fitW>
	<span>
        Comisión por inscripción añadida exitosamente. 
    </span>
    <div class="flex w-full justify-center">
        <Button action={() => goto("/AdministrarComisionInscripcion")}>Aceptar</Button>
    </div>
</Popup>