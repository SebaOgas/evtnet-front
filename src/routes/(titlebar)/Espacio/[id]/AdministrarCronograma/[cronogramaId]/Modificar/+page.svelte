<script lang="ts">
    /*
        Built with assistance from Claude
    */
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { page } from "$app/state";
	import { CronogramaService } from "$lib/services/CronogramaService";
	import { HttpError } from "$lib/request/request";
	import type DTOVerificacionVigencia from "$lib/dtos/espacios/DTOVerificacionVigencia";
	import type DTOCronogramaEspacio from "$lib/dtos/espacios/DTOCronogramaEspacio";

	$: errorPermiso = false;
	$: id = Number(page.params.id);
	$: idCronograma = Number(page.params.cronogramaId);
	$: idSubEspacio = Number(page.url.searchParams.get("idSubEspacio")) || 0;

	$: listo = false

	$: data = {
		nombreEspacio: "",
		idCronograma: 0,
		fechaDesde: new Date(),
		fechaHasta: new Date(),
		diasHaciaAdelante: 0
	} as DTOCronogramaEspacio;

	$: fechaDesde = null as Date | null;
	$: fechaHasta = null as Date | null;
	$: diasHaciaAdelante = "";

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

	$: popupErrorVisible = false;
	$: popupConfirmacionVisible = false;
	$: popupExitoVisible = false;

	$: forceValidateVigencia = false;
	$: warningDiasVisible = false;

	$: verificacion = null as DTOVerificacionVigencia | null;
	$: verificando = false;

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
			data = await CronogramaService.obtenerCronogramaEspacio(id);
			fechaDesde = data.fechaDesde
			fechaHasta = data.fechaHasta
			diasHaciaAdelante = "" + data.diasHaciaAdelante
			listo = true;
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
				reason: "Es obligatorio ingresar la anticipación máxima de reserva"
			};
		}

		// Check if it's a valid integer (no decimals, no non-numeric characters)
		if (!/^\d+$/.test(dias.trim())) {
			warningDiasVisible = true;
			return {
				valid: false,
				reason: "Debe ingresar una cantidad entera positiva de días para la anticipación máxima de reserva"
			};
		}

		const numero = parseInt(dias);
		if (numero <= 0) {
			warningDiasVisible = true;
			return {
				valid: false,
				reason: "Debe ingresar una cantidad entera positiva de días para la anticipación máxima de reserva"
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
			verificacion = await CronogramaService.verificarVigencia(id, idCronograma, fechaDesde!, fechaHasta!);
			
			if (verificacion.cronogramasSuperpuestos.length > 0) {
				popupErrorVisible = true;
			} else {
				popupConfirmacionVisible = true;
			}
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
			console.log(e);
			
		} finally {
			verificando = false;
		}
	}

	async function confirmarModificacion() {
		popupConfirmacionVisible = false;
		
		try {
			await CronogramaService.modificarCronograma(idCronograma, fechaDesde!, fechaHasta!, parseInt(diasHaciaAdelante), idSubEspacio);
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
	}

	function cancelar() {
		goto(`/Espacio/${id}/AdministrarCronograma?idSubEspacio=${idSubEspacio}`);
	}
</script>

<div id="content">
	{#if listo}
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">Modificar cronograma</h1>
		<h2 class="text-center">{data.nombreEspacio}</h2>

		<DatePicker 
			range 
			label="Vigencia" 
			bind:startDate={fechaDesde} 
			bind:endDate={fechaHasta}
			validate={() => validateVigencia(fechaDesde, fechaHasta)}
			minDate={new Date()}
		/>

		<div>
			<span>Anticipación máxima de reserva:</span>
			<div class="flex items-center gap-2 mt-1">
				<TextField 
					label=""
					bind:value={diasHaciaAdelante} 
					classes="w-20"
					change={() => validateDiasHaciaAdelante(diasHaciaAdelante)}
				/>
				<span>días</span>
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
	{/if}
</div>

<!-- Confirmation popup -->
<Popup title="Modificar cronograma" bind:visible={popupConfirmacionVisible} fitH fitW>
	<div class="flex flex-col gap-4">
		<p>¿Está seguro de que desea modificar el cronograma?</p>

		{#if verificacion && verificacion.eventosProblematicos.length > 0}
			<p>Hay eventos organizados que dejarán de estar abarcados por este cronograma:</p>

			<div class="flex flex-col gap-2 ml-2">
				{#each verificacion.eventosProblematicos as evt}
					<div>{evt.nombre}: {formatDate(evt.fechaHoraInicio, true)}</div>
				{/each}
			</div>

			<p>Si continúa, los eventos seguirán programados, y los horarios del nuevo cronograma solo serán utilizables cuando no se superpongan con dichos eventos.</p>
		{/if}

		<div class="flex justify-center items-center gap-2 w-full">
			<Button action={() => {popupConfirmacionVisible = false}}>Cancelar</Button>
			{#if verificacion && verificacion.eventosProblematicos.length > 0}
				<Button action={() => {goto(`/Espacio/${id}/Eventos`)}}>Buscar eventos</Button>
			{/if}
			<Button action={confirmarModificacion}>Confirmar</Button>
		</div>
	</div>
</Popup>

<!-- Error popup -->
<Popup title="Error" bind:visible={popupErrorVisible} fitH fitW>
	<div class="flex flex-col gap-4">
		<p>No se puede modificar este cronograma, dado que se superpone su vigencia con los siguientes cronogramas:</p>
		
		<div class="flex flex-col gap-2 ml-2">
			{#if verificacion}
				{#each verificacion.cronogramasSuperpuestos as cronograma}
					<div>{formatDate(cronograma.fechaDesde)} - {formatDate(cronograma.fechaHasta)}</div>
				{/each}
			{/if}
		</div>

		<p>Modifique los cronogramas anteriores antes de modificar este cronograma, o verifique el rango de fechas ingresadas.</p>

		<div class="flex justify-center items-center gap-2 w-full">
			<Button action={() => {popupErrorVisible = false}}>Cerrar</Button>
			<Button action={() => {goto(`/Espacio/${id}/AdministrarCronograma?idSubEspacio=${idSubEspacio}`)}}>Administrar cronogramas</Button>
		</div>
	</div>
</Popup>

<!-- Success popup -->
<Popup bind:visible={popupExitoVisible} fitH fitW>
	Cronograma modificado correctamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => {goto(`/Espacio/${id}/AdministrarCronograma/${idCronograma}?idSubEspacio=${idSubEspacio}`)}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para administrar cronogramas.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>