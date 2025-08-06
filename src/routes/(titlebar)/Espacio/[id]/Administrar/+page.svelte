<script lang="ts">
    /*
        Built with assistance from Claude
    */
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import type DTOEspacioEditar from "$lib/dtos/espacios/DTOEspacioEditar";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import { HttpError } from "$lib/request/request";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { page } from "$app/state";

	$: errorPermiso = false;
	$: id = Number(page.params.id);

	onMount(async () => {     
		if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if(!userPermisos.includes("AdministracionEspaciosPrivados") && !userPermisos.includes("AdministracionEspaciosPublicos")) {
			errorPermiso = true;
			return;
		}

		try {
			const espacioData = await EspaciosService.obtenerEspacioEditar(id);
			
			// Check specific permissions based on space type
			if (espacioData.esPublico && !userPermisos.includes("AdministracionEspaciosPublicos")) {
				errorPermiso = true;
				return;
			}
			if (!espacioData.esPublico && !userPermisos.includes("AdministracionEspaciosPrivados")) {
				errorPermiso = true;
				return;
			}

			dataLoaded = espacioData;
			ubicacion = {x: espacioData.latitud, y: espacioData.longitud};
			
			// Convert disciplinas array to Map for PopupSeleccion
			disciplinas.clear();
			espacioData.disciplinas.forEach(d => {
				disciplinas.set(d.id, d.nombre);
			});
			disciplinas = disciplinas; // Trigger reactivity
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}            
		}
	});

	let dataLoaded: DTOEspacioEditar | null = null;

	$: data = dataLoaded || {
		id: 0,
		nombre: "",
		descripcion: "",
		direccion: "",
		latitud: 0,
		longitud: 0,
		disciplinas: [],
		esAdmin: false,
		esPropietario: false,
		esPublico: false
	} as DTOEspacioEditar;

	let ubicacion: {x: number, y: number} | undefined = undefined;

	$: popupDisciplinasVisible = false;
	let disciplinas: Map<number, string> = new Map<number, string>();

	async function buscarDisciplinas(val: string) {
		let response = await DisciplinasService.buscar(val);

		let ret: Map<number, string> = new Map();

		response.forEach((val) => {
			ret.set(val.id, val.nombre);
		});

		return ret;
	}

	function validateNombre(val: string) {
		if (val.trim() === "") {
			return {
				valid: false,
				reason: "El nombre es obligatorio"
			}
		}

		return {
			valid: true,
			reason: undefined
		}
	}

	function validateDireccion(val: string) {
		if (val.trim() === "") {
			return {
				valid: false,
				reason: "La dirección es obligatoria"
			}
		}

		return {
			valid: true,
			reason: undefined
		}
	}

	$: warningNombreVisible = false;
	$: warningDireccionVisible = false;
	$: warningUbicacionVisible = false;

	$: errorGenerico = ""
	$: errorGenericoVisible = false

	$: popupConfirmDejarVisible = false;
	$: popupExitoVisible = false;

	async function guardarEspacio() {
		if (data.nombre.trim() === "") {
			warningNombreVisible = true;
		} else {
			warningNombreVisible = false;
		}

		if (data.direccion.trim() === "") {
			warningDireccionVisible = true;
		} else {
			warningDireccionVisible = false;
		}

		if (ubicacion === undefined) {
			warningUbicacionVisible = true;
		} else {
			warningUbicacionVisible = false;
		}

		if (
			data.nombre.trim() === ""
			|| data.direccion.trim() === ""
			|| ubicacion === undefined
		) {return}

		data.latitud = ubicacion.x;
		data.longitud = ubicacion.y;

		// Clear and rebuild disciplinas array
		data.disciplinas = [];
		disciplinas.forEach((nombre, id) => {
			data.disciplinas.push({id, nombre});
		});

		try {
			await EspaciosService.editarEspacio(data);
			
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}   
		}
	}

	function cancelar() {
		// TODO: Complete navigation path on cancel
		goto(`/Espacio/${id}`);
	}

	async function dejarDeSerAdministrador() {
		try {
			await EspaciosService.dejarDeAdministrar(id);
			
			// TODO: Complete navigation path after leaving admin
			goto(`/Espacio/${id}`);
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
		popupConfirmDejarVisible = false;
	}
</script>

<PopupSeleccion title="Seleccionar disciplinas" multiple={true} bind:visible={popupDisciplinasVisible} searchFunction={buscarDisciplinas} bind:selected={disciplinas}/>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">
			Administrar espacio
		</h1>

		<TextField label="Nombre del espacio" bind:value={data.nombre} validate={validateNombre} forceValidate={warningNombreVisible}/>

		<TextField label="Descripción del espacio" multiline bind:value={data.descripcion} rows={6}/>

		<TextField label="Dirección" bind:value={data.direccion} validate={validateDireccion} forceValidate={warningDireccionVisible}/>

		{#if dataLoaded}
		<div class="mb-2 mt-2">
			Ubicación
			<MapDisplay latitude={data.latitud} longitude={data.longitud} bind:marked={ubicacion} zoom={12}/>
			<Warning text="La ubicación es obligatoria" visible={warningUbicacionVisible}/>
		</div>
		{/if}

		<div class="mb-2 mt-2">
			<div class="flex justify-start gap-2">
				<span>Disciplinas</span>
				<Button action={() => {popupDisciplinasVisible = !popupDisciplinasVisible}}>Seleccionar</Button>
			</div>
			<div class="commaList">
				{#each disciplinas as d}
					<span>{d[1]}</span>
				{/each}
			</div>
		</div>
	</div>

	<div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={cancelar}>Cancelar</Button>
		<Button action={guardarEspacio}>Guardar</Button>
		{#if !data.esPublico}
			<Button action={() => {goto(`/Espacio/${id}/AdministrarCronograma`)}}>Administrar cronograma</Button>
		{/if}
		<Button action={() => {goto(`/Espacio/${id}/Eventos`)}}>Ver eventos</Button>
		<Button action={() => {goto(`/Espacio/${id}/AdministrarImagenes`)}}>Administrar imágenes</Button>
		<Button action={() => {goto(`/Espacio/${id}/AdministrarCaracteristicas`)}}>Administrar características</Button>
		{#if !data.esPublico}
			<Button action={() => {goto(`/Espacio/${id}/GestionarAdministradores`)}}>Gestionar administradores</Button>
			<Button action={() => {popupConfirmDejarVisible = true}}>Dejar de ser administrador</Button>
		{/if}
		{#if data.esPublico}
			<Button action={() => {goto(`/SEP/?espacio=${id}`)}}>Ver solicitudes relacionadas</Button>
		{/if}
	</div>
</div>

<!-- Success popup -->
<Popup bind:visible={popupExitoVisible} fitH fitW>
	Espacio modificado exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => {goto(`/Espacio/${id}`)}}>Aceptar</Button>
	</div>
</Popup>

<!-- Confirmation popup for leaving admin -->
<Popup bind:visible={popupConfirmDejarVisible} fitH fitW>
	¿Está seguro que quiere dejar de ser administrador del espacio?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupConfirmDejarVisible = false}}>Cancelar</Button>
		<Button action={dejarDeSerAdministrador}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para administrar espacios.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>