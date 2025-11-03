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
	import ComboBox from "$lib/components/ComboBox.svelte";
	import type { DTOArchivo, DTOEspacioEstado, DTOEstadoEspacio, DTOSubespacioEditar } from "$lib/dtos/espacios/DTOEspacioEditar";
	import FilePicker from "$lib/components/FilePicker.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import type { D } from "vitest/dist/chunks/reporters.66aFHiyX.js";

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
			estadoEspacioSeleccionado= espacioData.estado?.id ?? 0;
			estadosEspacio.clear();
			espacioData.estadosEspacio!.forEach(e => {
				if((e.id!==4 && e.id!==5 && e.id!==6))
					estadosEspacio.set(e.id, e.nombre);
			});
			estadosEspacio = estadosEspacio; // Trigger reactivity
			ubicacion = {x: espacioData.latitud, y: espacioData.longitud};
			
			// Convert disciplinas array to Map for PopupSeleccion
			disciplinas.clear();
			/* espacioData.disciplinas.forEach(d => {
				disciplinas.set(d.id, d.nombre);
			}); */
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
		esAdmin: false,
		esPropietario: false,
		esPublico: false,
		basesYCondiciones:null,
		documentacion:[] as DTOArchivo[],
		estado:{} as DTOEspacioEstado ,
		subEspacios: [] as DTOSubespacioEditar[],
		estadosEspacio:[] as DTOEstadoEspacio[]
	} as DTOEspacioEditar;

	let subespacio : DTOSubespacioEditar = {
        nombre: "",
        descripcion: "",
        capacidadMaxima: 1,
        disciplinas: []
    }

	let ubicacion: {x: number, y: number} | undefined = undefined;

	$: popupDisciplinasVisible = false;
	let disciplinas: Map<number, string> = new Map<number, string>();
	$: estadosEspacio = new Map<number, string>();
    let estadoEspacioSeleccionado : number  = 0;

	$: popupSubespacioVisible = false;
    $: confirmarVisible = false;
    $: warningNombreSubespacioVisible = false;
    $: warningCapacidadMaximaVisible = false;
    let title = "Nuevo subespacio";  

    let disciplinasSeleccionadas : Map<number, string> = new Map<number, string>();
	let documentacionFiles: File[] = [];
	let basesYCondicionesFile: File | null = null;
    let tooltipVisible = false;
    let requiereAprobacionEventos = false;
	let popupSubEspaciosVisible=false;
	let subEspacioSeleccionado : Map<number, string> = new Map<number, string>();
	let esCronograma = false;

	$: if (!popupSubEspaciosVisible && subEspacioSeleccionado.size > 0 ) {
		if(esCronograma)
        	goto(`/Espacio/${id}/AdministrarCronograma?idSubEspacio=${Array.from(subEspacioSeleccionado.keys())[0]}`);
		else
        	goto(`/Espacio/${id}/AdministrarCaracteristicas?idSubEspacio=${Array.from(subEspacioSeleccionado.keys())[0]}`);
    }

	function cerrar() {
        console.log(disciplinas)
        disciplinasSeleccionadas = disciplinas;
        popupSubespacioVisible = false;
        subespacio = {
            nombre: "",
            descripcion: "",
            capacidadMaxima: 1,
            disciplinas: []
        }
        warningNombreVisible = false;
        warningCapacidadMaximaVisible = false;
        confirmarVisible = false;
    }

    function confirmar() {
        if (subespacio.nombre === "") {
            warningNombreSubespacioVisible = true;
        } else {
            warningNombreSubespacioVisible = false;
        }

        if (subespacio.capacidadMaxima === null || subespacio.capacidadMaxima === undefined || subespacio.capacidadMaxima < 1) {
            warningCapacidadMaximaVisible = true;
        } else {
            warningCapacidadMaximaVisible = false;
        }

        if (subespacio.nombre !== "" && subespacio.capacidadMaxima !== null && subespacio.capacidadMaxima !== undefined && subespacio.capacidadMaxima >= 1) {
            disciplinas.forEach((value, key) => {
				subespacio.disciplinas.push({ id: key, nombre: disciplinas.get(key) });
            })
            data.subEspacios.push(subespacio);
            data.subEspacios = [...data.subEspacios];
            cerrar();
        }
    }

	async function buscarSubEspacios() {
        let ret : Map<number, string> = new Map();

        data.subEspacios.forEach((val) => {
            ret.set(val.id!, val.nombre);
        });

        return ret;
    }

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

	function validateCapacidadMaxima(val: string | number | null) {
        if (val === null || val === undefined) {
            return {
                valid: false,
                reason: "La capacidad máxima es obligatoria"
            }
        }
        if (Number(val) < 1) {
            return {
                valid: false,
                reason: "La capacidad máxima debe ser un número mayor a 0"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }

	function eliminarDocumento(id: number | string) {
		data.documentacion = data.documentacion!.filter(d => d.id !== id);
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
		/* data.disciplinas = [];
		disciplinas.forEach((nombre, id) => {
			data.disciplinas.push({id, nombre});
		}); */

		try {
			// Si el estado fue cambiado, asignar el nuevo estado
			if (data.estado?.id !== estadoEspacioSeleccionado) {
				// Buscar el objeto estado en data.estadosEspacio
				const nuevoEstado = data.estadosEspacio!.find(e => e.id === estadoEspacioSeleccionado);
				if (nuevoEstado) {
					data.estado = nuevoEstado;
				}
			}
			await EspaciosService.editarEspacio(data, basesYCondicionesFile, documentacionFiles);           
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


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">
			Administrar {data.nombre}
		</h1>
		<span>Estado del espacio</span>

		{#if (data.estado!.id==2 || data.estado!.id==3) && (data.esAdmin || data.esPropietario)}
			<ComboBox options={estadosEspacio} bind:selected={estadoEspacioSeleccionado} maxHeight={7} />
		{:else}
			{data.estado!.nombre}
		{/if}		
		
		 {#if data.estado!.id==4 || data.estado!.id==5 || data.estado!.id==6}
			<TextField label="Descripción del estado" multiline bind:value={data.estado!.descripcion} rows={6}/>
		{/if}
		
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

		<!-- <div class="mb-2 mt-2">
			<div class="flex justify-start gap-2">
				<span>Disciplinas</span>
				<Button action={() => {popupDisciplinasVisible = !popupDisciplinasVisible}}>Seleccionar</Button>
			</div>
			<div class="commaList">
				{#each disciplinas as d}
					<span>{d[1]}</span>
				{/each}
			</div>
		</div> -->
		
		<div class="mb-2 mt-2">
            <div class="flex gap-2 relative md:flex-row">
                <span class="md:items-center gap-2  mt-3 mb-2">Documentación</span>
                <FilePicker bind:files={documentacionFiles} multiple label="" />
                
                <!-- <Button classes="px-4 h-10 text-xs" action={() => tooltipVisible = !tooltipVisible}> i </Button>
                {#if tooltipVisible}
                <div class="absolute left-12 top-10 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-50">
                    Aquí debe subir toda la documentación que acredite que es el dueño o que cuenta con el permiso de uso o alquiler del espacio
                </div>
                {/if} -->
            </div>        
			<div class="flex flex-col gap-2">
				{#each data.documentacion! as doc}
					<div class="flex items-center gap-2">
						<span>{doc.nombreArchivo}</span>
						<Button icon="/icons/cross.svg" action={() => {eliminarDocumento(doc.id)}} classes="shrink-0"></Button>
					</div>
				{/each}
			</div>
            <div class="flex gap-2 relative md:flex-row">                
                <span class="md:items-center gap-2  mt-3 mb-2">Bases y Condiciones</span>
                <FilePicker bind:file={basesYCondicionesFile} label="" placeholder=""/>
            </div> 
			{#if data.basesYCondiciones}
				<div class="flex flex-col gap-2">
					<div class="flex items-center gap-2">
						<span>{data.basesYCondiciones!.nombreArchivo}</span>
						<Button icon="/icons/cross.svg" action={() => {eliminarDocumento(data.basesYCondiciones!.nombreArchivo)}} classes="shrink-0"></Button>
					</div>
				</div>
			{/if}
            <CheckBox bind:checked={data.requiereAprobacion}>Requiere Aprobación de Eventos</CheckBox>    
        </div>
		<h2 class="text-m text-center">
            SubEspacios
        </h2>
        <div class="mb-2 mt-2">
            <div class="flex flex-col gap-2">
				{#each data.subEspacios as se}
					<div>
						<div class ="flex flex-row flex-wrap gap-2 h-fit p-2 items-center">{se.nombre}<Button icon="/icons/edit.svg" classes="ml-1" action={() => {popupSubespacioVisible = true; subespacio = {...se}}}></Button></div>
						<div>Capacidad máxima: {se.capacidadMaxima}</div>
						<div>Disciplinas: {
							se.disciplinas
								.map((d) => d.nombre ? d.nombre : d.id)
								.filter(Boolean)
								.join(", ")
						}</div>
						
					</div>
				{/each}
            </div>           
        </div>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={() => { popupSubespacioVisible = true; }}>Agregar Subespacio</Button>
        
    </div>
	<div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={cancelar}>Cancelar</Button>
		<Button action={guardarEspacio}>Guardar</Button>
		{#if !data.esPublico}
			<Button action={() => {popupSubEspaciosVisible = true; esCronograma = true}}>Administrar cronograma</Button>
		{/if}
		<Button action={() => {goto(`/Espacio/${id}/Eventos`)}}>Ver eventos</Button>
		<Button action={() => {goto(`/Espacio/${id}/AdministrarImagenes`)}}>Administrar imágenes</Button>
		<Button action={() => {popupSubEspaciosVisible = true; esCronograma = false}}>Administrar características</Button>
		{#if !data.esPublico}
			<Button action={() => {goto(`/Espacio/${id}/GestionarAdministradores`)}}>Gestionar administradores</Button>
			<Button action={() => {popupConfirmDejarVisible = true}}>Dejar de ser administrador</Button>
		{/if}
		{#if data.esPublico}
			<Button action={() => {goto(`/SEP/?espacio=${id}`)}}>Ver solicitudes relacionadas</Button>
		{/if}
	</div>
</div>

<PopupSeleccion title="SubEspacio" multiple={false} bind:visible={popupSubEspaciosVisible} searchFunction={buscarSubEspacios} bind:selected={subEspacioSeleccionado} fitH fitW/>

<Popup bind:title={title} bind:visible={popupSubespacioVisible} classes="z-40" fitH fitW>

    <div class="h-full grow">
        <TextField label="Nombre del subespacio" bind:value={subespacio.nombre} validate={validateNombre} forceValidate={warningNombreSubespacioVisible}/>
        <TextField label="Descripción del subespacio" multiline bind:value={subespacio.descripcion} rows={6}/>
        <TextField label="Capacidad máxima" min={1} bind:value={subespacio.capacidadMaxima} validate={validateCapacidadMaxima} forceValidate={warningCapacidadMaximaVisible}/>
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
    
    
    <div class="flex justify-center items-center w-full gap-2 mt-8">
        <Button action={cerrar}>Cancelar</Button>
        <Button action={confirmar} disabled={subespacio.nombre === "" || subespacio.capacidadMaxima === 0}>Confirmar</Button>
    </div>
</Popup>


<PopupSeleccion title="Seleccionar disciplinas" multiple={true} bind:visible={popupDisciplinasVisible} searchFunction={buscarDisciplinas} bind:selected={disciplinas} classes="z-40"/>

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