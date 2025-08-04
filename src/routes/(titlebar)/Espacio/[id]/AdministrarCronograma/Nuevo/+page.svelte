<script lang="ts">
    /*
        Built with assistance from Claude
    */
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import DatePicker from "$lib/components/DatePicker.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { page } from "$app/state";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { CronogramaService } from "$lib/services/CronogramaService";
	import { HttpError } from "$lib/request/request";
	import type DTOVerificacionVigencia from "$lib/dtos/espacios/DTOVerificacionVigencia";

	$: errorPermiso = false;
	$: id = Number(page.params.id);
	$: nombreEspacio = "";

	$: fechaDesde = null as Date | null;
	$: fechaHasta = null as Date | null;
	$: diasHaciaAdelante = "";

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

	$: popupConfirmacionVisible = false;
	$: popupExitoVisible = false;

	$: forceValidateVigencia = false;
	$: warningDiasVisible = false;

	$: verificacion = null as DTOVerificacionVigencia | null;
	$: verificando = false;

    $: idCronogramaNuevo = null as number | null;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionEspaciosPrivados") && !userPermisos.includes("AdministracionEspaciosPublicos")) {
			errorPermiso = true;
			return;
		}

		try {
			nombreEspacio = await EspaciosService.obtenerNombreEspacio(id);
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
	});

	function validateVigencia(desde: Date | null, hasta: Date | null) {        
		if (desde === null || hasta === null) {
            
			return {
				valid: false,
				reason: "Es obligatorio ingresar la vigencia del cronograma"
			};
		}


		return {
			valid: true,
			reason: undefined
		};
	}

	function validateDiasHaciaAdelante(dias: string) {
		if (dias.trim() === "") {
			warningDiasVisible = true;
			return {
				valid: false,
				reason: "Es obligatorio ingresar la cantidad de días hacia adelante"
			};
		}

		// Check if it's a valid integer (no decimals, no non-numeric characters)
		if (!/^\d+$/.test(dias.trim())) {
			warningDiasVisible = true;
			return {
				valid: false,
				reason: "Debe ingresar una cantidad entera positiva de días hacia adelante"
			};
		}

		const numero = parseInt(dias);
		if (numero <= 0) {
			warningDiasVisible = true;
			return {
				valid: false,
				reason: "Debe ingresar una cantidad entera positiva de días hacia adelante"
			};
		}

		warningDiasVisible = false;
		return {
			valid: true,
			reason: undefined
		};
	}

;

	async function validarYMostrarConfirmacion() {
		// Reset validation
		forceValidateVigencia = false;
		warningDiasVisible = false;

		let hasErrors = false;

		// Validate vigencia
		const vigenciaValidation = validateVigencia(fechaDesde, fechaHasta);
		if (!vigenciaValidation.valid) {
			forceValidateVigencia = true;
			hasErrors = true;
		}

		// Validate dias
		const diasValidation = validateDiasHaciaAdelante(diasHaciaAdelante);
		if (!diasValidation.valid) {
			warningDiasVisible = true;
			hasErrors = true;
		}

		if (hasErrors) {
			return;
		}

		// Check for conflicts
		verificando = true;
		try {
			verificacion = await CronogramaService.verificarVigencia(id, fechaDesde!, fechaHasta!);
			popupConfirmacionVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		} finally {
			verificando = false;
		}
	}

	async function confirmarCreacion() {
		popupConfirmacionVisible = false;
		
		try {
			idCronogramaNuevo = await CronogramaService.crearCronograma(id, fechaDesde!, fechaHasta!, parseInt(diasHaciaAdelante));
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
	}

	function cancelar() {
		goto(`/Espacio/${id}/AdministrarCronograma`);
	}
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">Crear cronograma</h1>
		<h2 class="text-center">{nombreEspacio}</h2>

		<DatePicker 
			range 
			label="Vigencia" 
			bind:startDate={fechaDesde} 
			bind:endDate={fechaHasta}
			validate={() => validateVigencia(fechaDesde, fechaHasta)}
			minDate={new Date()}
		/>

		<div>
			<span>Permite organización de eventos desde la fecha actual hasta:</span>
			<div class="flex items-center gap-2 mt-1">
				<TextField 
					label=""
					bind:value={diasHaciaAdelante} 
					classes="w-20"
					change={() => validateDiasHaciaAdelante(diasHaciaAdelante)}
				/>
				<span>días hacia adelante</span>
			</div>
		</div>

		<Warning text={validateDiasHaciaAdelante(diasHaciaAdelante).reason || ""} visible={warningDiasVisible}/>
	</div>

	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={cancelar}>Cancelar</Button>
		<Button action={validarYMostrarConfirmacion} disabled={verificando}>
			{verificando ? "Verificando..." : "Aceptar"}
		</Button>
	</div>
</div>

<!-- Confirmation popup -->
<Popup title="Generar cronograma" bind:visible={popupConfirmacionVisible} fitH fitW>
	<div class="flex flex-col gap-4">
		<p>¿Está seguro de que desea dar de alta el cronograma?</p>
		
		{#if verificacion}
			{#if verificacion.cronogramasSuperpuestos}
				<Warning 
					text="Se acotarán y/o eliminarán cronogramas, para evitar que sus vigencias se superpongan" 
					visible={true}
				/>
			{/if}
			
			{#if verificacion.eventosProgramados}
				<Warning 
					text="Hay al menos un evento programado en el rango de tiempo indicado para el nuevo cronograma. Si desea cancelarlos, diríjase a la lista de eventos de este espacio" 
					visible={true}
				/>
			{/if}
		{/if}

		<div class="flex justify-center items-center gap-2 w-full">
			<Button action={() => {popupConfirmacionVisible = false}}>Cancelar</Button>
			<Button action={confirmarCreacion}>Confirmar</Button>
		</div>
	</div>
</Popup>

<!-- Success popup -->
<Popup bind:visible={popupExitoVisible} fitH fitW>
	Cronograma generado correctamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => {goto(`/Espacio/${id}/AdministrarCronograma/${idCronogramaNuevo}`)}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para administrar cronogramas.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>