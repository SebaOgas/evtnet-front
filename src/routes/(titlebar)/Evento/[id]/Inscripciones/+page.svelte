<script lang="ts">
	import { goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupComprobante from "$lib/components/PopupComprobante.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import type DTOInscripcionesEvento from "$lib/dtos/espacios/DTOInscripcionesEvento";
	import { HttpError } from "$lib/request/request";
	import { EventosService } from "$lib/services/EventosService";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let previousPage: string = base;

	$: id = Number(page.params.id);
	$: data = null as DTOInscripcionesEvento | null;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		if (!get(permisos).includes("AdministracionEventos")) {
			errorPermiso = true;
			return;
		}

		buscarInscriptos();
	});

	// Error handling
	$: error = "";
	$: errorVisible = false;
	$: errorPermiso = false;

	// Success popup
	$: popupExitoVisible = false;
	$: popupConfirmacionVisible = false;

	$: busqueda = ""

	async function buscarInscriptos() {
		try {
			data = await EventosService.obtenerInscripciones(id,  busqueda);

			if (!data.esAdministrador && !data.esOrganizador) {
                errorPermiso = true;
                return;
            }
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}			
		}
	}

	$: selectedInscripcion = {} as any;

	function mostrarPopupCancelarInscripcion(inscripcion : any) {
		popupConfirmacionVisible = true;
		selectedInscripcion = inscripcion;
	}

	async function confirmarCancelacionInscripcion() {
		try {
			await EventosService.cancelarInscripcion(selectedInscripcion.id);
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
		popupConfirmacionVisible = false;
	}


	function loadFotoDePerfil(img: HTMLImageElement, username: string) {	
		(async () => {
			img.src = await UsuariosService.obtenerFotoDePerfil(username);
			img.style.display = "block";
		})()	
	}

	function reload() {
		popupExitoVisible = false;
		data = null;	
		buscarInscriptos();
	}

	$: numeroComprobanteAbierto = null as number | null; 
</script>

{#if data !== null}
<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-s text-center print:hidden">
			Evento
		</h1>
		<h1 class="text-m text-center">
			<span class="hidden print:inline">Inscripciones a </span> <span>{data.nombreEvento}</span>
		</h1>
		<h1 class="text-m text-center print:hidden">
			Administrar inscripciones
		</h1>

		<div class="flex w-full gap-2 items-center print:hidden">
			<TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={busqueda} action={buscarInscriptos}/>
			<Button icon="/icons/search.svg" action={buscarInscriptos} classes="h-fit"></Button>
		</div>

		<div class="flex flex-col gap-16">
			{#each data.inscripciones as inscripcion}
				<div class="flex flex-col">
					<div class="flex flex-row justify-between">
						<div class="flex items-center gap-2">
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<img use:loadFotoDePerfil={inscripcion.usuario.username} alt="Foto de perfil" class="h-[40px] w-[40px] rounded-full object-cover cursor-pointer hidden" on:click={() => {goto(`/Perfil/${inscripcion.usuario.username}`)}}>
							<div>{inscripcion.usuario.nombre} {inscripcion.usuario.apellido} (DNI N.°: {inscripcion.usuario.dni})</div>
						</div>
						{#if inscripcion.fechaCancelacionInscripcion === null}
							<Button classes="h-fit print:hidden" action={() => {mostrarPopupCancelarInscripcion(inscripcion)}}>Cancelar</Button>
						{/if}
					</div>
					<div class="flex flex-col gap-2 ml-4">
						<div class="flex flex-col justify-start items-end">
							<div>
								Inscripto en {formatDate(inscripcion.fechaInscripcion, true)}
							</div>
							{#if inscripcion.fechaCancelacionInscripcion !== null}
								<div>
									Cancelado en {formatDate(inscripcion.fechaCancelacionInscripcion, true)}
								</div>
							{/if}
						</div>
						<div class="flex flex-col gap-2">
							<div>Transferencias:</div>
							<div class="flex flex-col ml-4 gap-2">
								{#each inscripcion.transferencias as t}
									<div class="flex justify-between items-center">
										<div>{t.monto >= 0 ? "Pagó:" : "Devuelto:"}</div>
										<div class="flex gap-2 items-center">
											<div>
												${t.monto.toFixed(2).replaceAll(".", ",")}
											</div>
											<Button icon="/icons/documento.svg" action={() => {numeroComprobanteAbierto = t.numero}}></Button>
										</div>
									</div>
								{/each}
								<div class="flex justify-between items-center">
									<div>Total:</div>
									<div class="flex gap-2 items-center">
										<div>
											${inscripcion.transferencias.reduce((acc, v) => acc + v.monto, 0).toFixed(2).replaceAll(".", ",")}
										</div>
									</div>
								</div>
							</div>
						</div>
						{#if inscripcion.invitados.length > 0}
							<div class="flex flex-col gap-2">
								<div>Invitados:</div>
								<div class="flex flex-col gap-2 md:flex-row md:flex-wrap">
									{#each inscripcion.invitados as inv}
										<div class="ml-4">{inv.apellido}, {inv.nombre} (DNI N.°: {inv.dni})</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		

	</div>

	<div class="flex flex-wrap gap-2 h-fit p-2 justify-center items-center print:hidden">
		<Button action={() => goto(`/Evento/${id}/Administrar`)}>Atrás</Button>
		<Button action={window.print}>Exportar</Button>
	</div>
</div>
{/if}

<!-- Popups -->
<Popup title="Confirmar cambios" bind:visible={popupConfirmacionVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro de que desea cancelar la inscripción de {selectedInscripcion.usuario.nombre} {selectedInscripcion.usuario.apellido}?</p>

		<p>Se le devolverá al inscripto ${selectedInscripcion.transferencias.reduce((acc: number, v: any) => acc + v.monto, 0).toFixed(2).replaceAll(".", ",")}.</p>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupConfirmacionVisible = false}}>Cancelar</Button>
		<Button action={() => confirmarCancelacionInscripcion()}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupExitoVisible} fitH fitW>
	Inscripción cancelada exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={reload}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para administrar este evento.
</PopupError>

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<PopupComprobante bind:numero={numeroComprobanteAbierto}/>