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
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import { page } from "$app/state";
	import type DTOModificarInstanciaMascota from "$lib/dtos/mascota/DTOModificarInstanciaMascota";
	import type DTOInstanciaMascota from "$lib/dtos/mascota/DTOInstanciaMascota";
	import { InstanciasMascotaService } from "$lib/services/InstanciasMascotaService";
	import Warning from "$lib/components/Warning.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import type DTOImagenMascotaLista from "$lib/dtos/mascota/DTOImagenMascotaLista";
	import { ImagenesMascotaService } from "$lib/services/ImagenesMascotaService";
	import type DTOEventoMascota from "$lib/dtos/mascota/DTOEventoMascota";

	$: errorPermiso = false;
	$: errorVisible = false;
	$: error = "";
    $: exitoVisible = false;

	$: id = parseInt(page.params.id === undefined ? "0" : page.params.id);

	$: data = {
		id: id,
		nombre: "",
		descripcion: "",
		pageSelector: "",
		selector: "",
		eventos: [],
		imagenes: []
	} as DTOModificarInstanciaMascota;

	let original : DTOInstanciaMascota = {
		id: id,
		nombre: "",
		descripcion: "",
		pageSelector: "",
		selector: "",
		eventos: [],
		longitud: 0,
		fechaAlta: null,
		fechaBaja: null,
		secuencia: []
	};

	let listo = false;

	let popupProbarPageSelector = false;
	let urlProbar = "";
	let resultadoPageSelector = "";

	$: popupEventosVisible = false;

	let imagenesMascota : DTOImagenMascotaLista[] = [];
	let imagenesMap : Map<number, string> = new Map();

	let eventosMascota : DTOEventoMascota[] = [];
	let eventosMap : Map<number, string> = new Map();
	let eventosSeleccionados : Map<number, string> = new Map();

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionMascota")) {
			errorPermiso = true;
			return;
		}

		try {
			imagenesMascota = await ImagenesMascotaService.obtenerListaImagenesMascota();
			imagenesMascota.forEach(i => {
				imagenesMap.set(i.id, i.nombre)
			});

			eventosMascota = await InstanciasMascotaService.obtenerEventosMascota();
			eventosMascota.forEach(e => {
				eventosMap.set(e.id, e.nombre);
			});

			original = await InstanciasMascotaService.obtenerInstanciaMascotaCompleta(id);
		
			data.id = original.id;
			data.nombre = original.nombre;
			data.descripcion = original.descripcion;
			data.pageSelector = original.pageSelector;
			data.selector = original.selector;
			data.eventos = original.eventos.map(e => e.id);
			data.imagenes = original.secuencia?.map(s => ({
				texto: s.texto,
				imagenId: s.imagenId
			})) || [];

			// Populate eventosSeleccionados
			original.eventos.forEach(e => {
				eventosSeleccionados.set(e.id, e.nombre);
			});
			eventosSeleccionados = eventosSeleccionados;
		} catch(e) {
			if(e instanceof HttpError) {
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
				reason: "Es obligatorio el nombre de la instancia"
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

	function validateDescripcion(descripcion: string) {
		if (descripcion.length > 1000) {
			return {
				valid: false,
				reason: "Máximo 1000 caracteres"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	function validatePageSelector(pageSelector: string) {
		if (pageSelector === null) pageSelector = "";
		pageSelector = pageSelector.trim();
		if (pageSelector.length === 0) {
			return {
				valid: false,
				reason: "Es obligatorio el selector de páginas"
			};
		}
		if (pageSelector.length > 1000) {
			return {
				valid: false,
				reason: "Máximo 1000 caracteres"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	function validateSelector(selector: string) {
		selector = selector.trim();
		if (selector.length === 0) {
			return {
				valid: false,
				reason: "Es obligatorio el selector de elementos"
			};
		}
		if (selector.length > 1000) {
			return {
				valid: false,
				reason: "Máximo 1000 caracteres"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	$: completado = (
		validateNombre(data.nombre).valid &&
		validateDescripcion(data.descripcion).valid &&
		validatePageSelector(data.pageSelector).valid &&
		validateSelector(data.selector).valid &&
		eventosSeleccionados.size > 0
	);

	function probarPageSelector() {
		urlProbar = "";
		resultadoPageSelector = "";
		popupProbarPageSelector = true;
	}

	function ejecutarProbarPageSelector() {
		try {
			// Extract path from URL
			let path = urlProbar.trim();
			path = path.replace(/^https?:\/\/[^\/]+/, ''); // Remove protocol and domain
			path = path.split('?')[0]; // Remove query params
			path = path.replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes
			
			const patterns = data.pageSelector.split(',').map(p => p.trim().replace(/^\/|\/$/g, ''));
			const valida = patterns.some(pattern => {
				const regexPattern = '^' + pattern.replace(/\*/g, '.*') + '$';
				const regex = new RegExp(regexPattern);
				return regex.test(path);
			});
			
			resultadoPageSelector = valida 
				? "El selector valida la URL ingresada" 
				: "El selector no valida la URL ingresada";
		} catch (e) {
			resultadoPageSelector = "Error en el selector";
		}
	}

	async function guardar() {
		try {
			// Convert selected eventos map to array of ids
			data.eventos = Array.from(eventosSeleccionados.keys());
			
			await InstanciasMascotaService.modificarInstanciaMascota(data);
			exitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	}

	function cancelar() {
		goto("/AdministrarInstanciasMascota");
	}

	function addImagen() {
		data.imagenes.push({
			texto: "",
			imagenId: null
		});
		data.imagenes = [...data.imagenes];
	}

	function removeImagen(ix: number) {
		data.imagenes.splice(ix, 1);
		data.imagenes = [...data.imagenes];
	}

	async function buscarEventos() {
		let ret : Map<number, string> = new Map();
		eventosMascota.forEach((e) => {
			ret.set(e.id, e.nombre);
		});

		return ret;
	}
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow md:grow-0">
		<h1 class="text-m text-center md:text-start">Modificar Instancia de Mascota</h1>
		
		{#if listo}
		<div class="flex flex-col gap-2 overflow-y-auto grow w-full">
			<TextField 
				label="Nombre" 
				bind:value={data.nombre} 
				classes="w-full" 
				validate={validateNombre}
				forceValidate
				max={50}
			/>

			<div class="flex flex-col md:flex-row">
				<TextField 
					label="Descripción"
					multiline
					rows={10}
					bind:value={data.descripcion} 
					classes="w-full"
					validate={validateDescripcion}
					max={1000}
				/>
				<Warning visible={data.descripcion===""} text={"Se recomienda ingresar una descripción que describa cuándo y por qué se muestra la instancia"} classes="h-fit"/>
			</div>
			
			<div class="flex gap-2 items-end">
				<TextField 
					label="Selector de páginas" 
					bind:value={data.pageSelector} 
					classes="w-full" 
					validate={validatePageSelector}
					forceValidate
					placeholder="ruta/a/recurso, otra/ruta, ruta/con/comodin/*"
					max={1000}
				/>
				<Button action={probarPageSelector} classes="h-fit">Probar</Button>
			</div>

			<TextField 
				label="Selector de elemento(s)" 
				bind:value={data.selector} 
				classes="w-full" 
				validate={validateSelector}
				forceValidate
				max={1000}
			/>

			<div class="flex justify-start gap-2 items-center">
				<span>Eventos</span>
				<Button action={() => {popupEventosVisible = true}}>Seleccionar</Button>
			</div>
			<div class="commaList">
				{#each eventosSeleccionados as e}
					<span>{e[1]}</span>
				{/each}
			</div>
			<Warning visible={eventosSeleccionados.size === 0} text="Debe seleccionar al menos un evento"/>

			<div class="flex items-center gap-2">
				<h2 class="text-m">Secuencia</h2>
				<Button icon="/icons/plus.svg" action={addImagen}></Button>
				<Button icon="/icons/view.svg" action={() => {}}></Button>
			</div>
			<div class="flex flex-col gap-2">
				{#each data.imagenes as imagen, ix}
					<div class="flex gap-2 justify-between items-start">
						<div class="flex h-full justify-center items-center text-dark font-bold"><span>{ix+1}°</span></div>
						<div class="flex grow flex-col gap-2">
							<div class="flex gap-2">
								<span>Texto:</span>
								<TextField 
									label={null}
									multiline
									rows={3}
									bind:value={imagen.texto} 
									classes="w-full"
									max={1000}
								/>
							</div>
							<Warning visible={imagen.texto.trim() === ""} text="Es obligatorio ingresar el texto a mostrar con la imagen"/>
						</div>
						<div class="flex grow flex-col gap-2">
							<div class="flex gap-2">
								<span>Imagen:</span>
								<ComboBox options={imagenesMap} bind:selected={imagen.imagenId} maxHeight={3}/>
							</div>
							<Warning visible={imagen.imagenId === null || imagen.imagenId === undefined} text="Seleccione la imagen"/>
						</div>
						{#if imagen.imagenId !== null && imagen.imagenId !== undefined}
							<div class="flex justify-center">
								<img src={imagenesMascota.filter(i => i.id === imagen.imagenId).at(0)?.url} alt="Mascota" class="h-18" />
							</div>
						{/if}
						<div class="flex h-full justify-center items-center">
							<Button icon="/icons/cross.svg" action={() => removeImagen(ix)}></Button>
						</div>
					</div>
				{/each}
			</div>
		</div>
		{/if}
	</div>
		
	<div class="flex gap-2 h-fit p-2 justify-center items-center md:justify-start">
		<Button classes="text-m ayuda">Ayuda</Button>
		<Button classes="text-m" action={cancelar}>Cancelar</Button>
		<Button classes="text-m" action={guardar} disabled={!completado}>Guardar</Button>
	</div>
</div>

<Popup bind:visible={popupProbarPageSelector} fitH fitW title="Probar selector de páginas">
	<p>Ingrese la URL que debería ser validada por el selector</p>
	<p class="font-semibold">"{data.pageSelector}"</p>
	<TextField 
		label={null}
		placeholder="URL a probar"
		bind:value={urlProbar} 
		classes="w-full"
		action={ejecutarProbarPageSelector}
	/>
	{#if resultadoPageSelector}
		<p class="mt-2">{resultadoPageSelector}</p>
	{/if}
	<div class="flex justify-center items-center gap-2 w-full mt-2">
		<Button action={() => {popupProbarPageSelector = false; urlProbar = ""; resultadoPageSelector = ""}}>Cerrar</Button>
		<Button action={ejecutarProbarPageSelector}>Probar</Button>
	</div>
</Popup>

<PopupSeleccion title="Selección de eventos" multiple={true} bind:visible={popupEventosVisible} searchFunction={buscarEventos} bind:selected={eventosSeleccionados} noSearch forceReSearch/>

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para modificar instancias de mascota.
</PopupError>

<Popup bind:visible={exitoVisible} fitH fitW>
	<span>
		Instancia de mascota modificada exitosamente. 
	</span>
	<div class="flex w-full justify-center">
		<Button action={() => goto("/AdministrarInstanciasMascota")}>Aceptar</Button>
	</div>
</Popup>
