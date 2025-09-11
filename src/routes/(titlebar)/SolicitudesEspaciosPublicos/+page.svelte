<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { HttpError } from "$lib/request/request";
	import type DTOBusquedaSEP from "$lib/dtos/espacios/DTOBusquedaSEP";
	import type DTOResultadoBusquedaSEP from "$lib/dtos/espacios/DTOResultadoBusquedaSEP";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import PopupUbicacion from "$lib/components/PopupUbicacion.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import Table from "$lib/components/Table.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import type DTOSolicitudEPCompleta from "$lib/dtos/espacios/DTOSolicitudEPCompleta";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    let filtros : DTOBusquedaSEP = {
		texto: "",
		ubicacion: undefined,
		tipos: [],
		fechaIngresoDesde: null,
        fechaIngresoHasta: null,
		fechaUltimoCambioEstadoDesde: null,
        fechaUltimoCambioEstadoHasta: null,
        espacios: [],
        estados: []
	};

    let page = 0;
    let lastPage = 0;
    $: page, buscar();

    let listo = false;

    $: resultados = [] as DTOResultadoBusquedaSEP[];

    $: estados = [] as {id: number, nombre: string, checked: boolean | undefined}[];

    $: estadoSeleccionado={id: 0, nombre: ""};


    onMount(async () => {
		if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionEspaciosPublicos")) {
			errorPermiso = true;
			return;
		}

        try {
			estados = await EspaciosService.obtenerEstadosSEP();
            estados.forEach((e, i, arr) => {
                arr[i].checked = true;
                estadosOption.set(e.id, e.nombre);
            })
            listo = true;
            buscar();
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
	});


    async function buscar() {
        filtros.estados = [];

        estados.forEach(e => {
            if (e.checked) {
                filtros.estados.push(e.id);
            }
        })

        filtros.fechaIngresoDesde = fechaIngresoDesde;
        filtros.fechaIngresoHasta = fechaIngresoHasta;
        filtros.fechaUltimoCambioEstadoDesde = fechaCambioEstadoDesde;
        filtros.fechaUltimoCambioEstadoHasta = fechaCambioEstadoHasta;

        filtros.espacios = [];
        espacios.keys().forEach(d => {
            filtros.espacios.push(d);
        })

        if (ubicacion !== undefined && buscarPorUbicacion) {
            filtros.ubicacion = {
                latitud: ubicacion.x,
                longitud: ubicacion.y,
                rango: rango
            };
        } else {
            filtros.ubicacion = undefined;
        }

        try {
			resultados = await EspaciosService.buscarSolicitudesEspaciosPublicos(filtros);
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    
    let minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    let maxDate = new Date();

    let fechaIngresoDesde: Date | null = filtros.fechaIngresoDesde;
    let fechaIngresoHasta: Date | null = filtros.fechaIngresoHasta;

    let fechaCambioEstadoDesde: Date | null = filtros.fechaUltimoCambioEstadoDesde;
    let fechaCambioEstadoHasta: Date | null = filtros.fechaUltimoCambioEstadoHasta;

    let solicitud : DTOSolicitudEPCompleta | null = null;

    $: popupDetalleVisible = false;
    $: popupCambiarEstadoVisible = false;

    async function mostrarSolicitud(solicitudSimple:DTOResultadoBusquedaSEP){
        solicitud={
            idSEP: solicitudSimple.idSEP,
            nombreEspacio: solicitudSimple.nombreEspacio,
            fechaIngreso: solicitudSimple.fechaIngreso,
            descripcion: "",
            direccion: "",
            latitud: 0,
            longitud: 0,
            justificacion: "",
            solicitante: {
                username: "",
                nombre: "",
                apellido: "",
                email: "",
                urlFotoPerfil: null
            },
            SEPEstado: []
        }

        popupDetalleVisible = true;
        try {
            solicitud = await EspaciosService.obtenerDetalleSolicitudEP(solicitudSimple.idSEP);
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }   
        }
    }
    $: buscarPorUbicacion = false;
    $: popupUbicacionVisible = false;
    let ubicacion : {x: number, y: number} | undefined;
    let rango : number;

    $: popupEspaciosVisible = false;

    let espacios : Map<number, string> = new Map<number, string>();

    let estadosOption : Map<number, string> = new Map<number, string>();

    $:warningDescripcionVisible = false;
    $:warningEstadoVisible = false;

    async function buscarEspacios(val: string) {
        //let response = await EspaciosService.buscar(val);

        let ret : Map<number, string> = new Map();

        //response.forEach((val) => {
        //    ret.set(val.id, val.nombre);
        //});

        return ret;
    }
    function validateDescripcion(val: string) {
        if (val.trim() === "" || val.trim().length < 50) {
            return {
                valid: false,
                reason: "La descripción debe tener al menos 50 caracteres"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }

    async function cambiarEstadoSEP() {
        if (estadoSeleccionado.id === 0) {
            errorGenerico = "Debe seleccionar un estado";
            errorGenericoVisible = true;
            return;
        }
        if (solicitud?.descripcion === "") {
            warningDescripcionVisible = true;
        } else {
            warningDescripcionVisible = false;
        }
        if (estadoSeleccionado === null) {
            warningEstadoVisible = true;
        } else {
            warningEstadoVisible = false;
        }
        if (
            estadoSeleccionado.id === 0
            || solicitud?.descripcion === ""
        ) {return}

        try {
            await EspaciosService.cambiarEstadoSEP(solicitud!.idSEP, estadoSeleccionado.id);
            popupCambiarEstadoVisible = false;
            popupDetalleVisible = false;
            buscar();
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }   
        }
    }
    
</script>



<PopupSeleccion title="Filtrar por espacio" multiple={true} bind:visible={popupEspaciosVisible} searchFunction={buscarEspacios} bind:selected={espacios}/>
<PopupUbicacion bind:visible={popupUbicacionVisible} max={100000} bind:ubicacion={ubicacion} bind:radius={rango}/>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center flex justify-between items-center gap-2">
            <span>Solicitudes de Espacio Público</span>
            <Button action={() => {goto("/CrearEspacio")}} classes="shrink-0">Nuevo Espacio Público</Button>
        </h1>

        {#if listo}
            <div class="flex w-full gap-2 items-center">
                <TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={filtros.texto} action={buscar}></TextField>
                <Button icon="/icons/search.svg" action={buscar} classes="h-fit"></Button>
            </div>

            <div class="flex justify-start items-center gap-2">
                <CheckBox bind:checked={buscarPorUbicacion}>Buscar por ubicación</CheckBox>
                <Button disabled={!buscarPorUbicacion} action={() => {popupUbicacionVisible = true;}}>{#if ubicacion === undefined}Seleccionar{:else}Cambiar{/if}</Button>
            </div>

            <div>
                <span>Estados:</span>
                <div class="flex flex-col justify-start items-start pl-2 gap-2">
                    {#each estados as estado}
                        <CheckBox bind:checked={estado.checked}>{estado.nombre}</CheckBox>
                    {/each}
                </div>
            </div>

            <DatePicker range label="Fechas de ingreso: " bind:startDate={fechaIngresoDesde} bind:endDate={fechaIngresoHasta} {minDate} {maxDate} classes="!md:w-[70%]"/>

            <DatePicker range label="Fechas de último cambio de estado: " bind:startDate={fechaCambioEstadoDesde} bind:endDate={fechaCambioEstadoHasta} {minDate} {maxDate} classes="!md:w-[70%]"/>
            
            <Table cols={["Nombre del Espacio", "Estado", "Ingreso", "Último cambio de estado", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombreEspacio}</td>
                        <td>{d.estado}</td>
                        <td>{formatDate(d.fechaIngreso, true)}</td>
                        <td>{formatDate(d.fechaUltimoCambioEstado, true)}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/edit.svg" action={() => mostrarSolicitud(d)}></Button>
                                <Button icon="/icons/change_state.svg" action={() => mostrarSolicitud(d)}></Button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </Table>
        {/if}

	</div>
    <div class="flex gap-2 h-fit p-2 justify-end items-center">
        <PageControl bind:page={page} lastPage={lastPage}/>
    </div>
</div>

{#if solicitud !== null}
    <Popup bind:visible={popupDetalleVisible} title="Solicitud de Espacio Público" fitH fitW>
        <div class="flex flex-col md:flex-row gap-8 md:gap-4 items-start w-full h-fit mb-4">
            <div class="flex flex-col gap-2 flex-1">
                <span>Espacio vinculado: {solicitud.nombreEspacio}</span>
                
                <span>Solicitante: <img src={solicitud.solicitante.urlFotoPerfil} alt="Foto de perfil" on:click={() => goto('/Perfil/' + solicitud?.solicitante.username)} class="w-12 h-12 rounded-full"/>
                    {solicitud.solicitante.nombre} {solicitud.solicitante.apellido} (@{solicitud.solicitante.username})
                </span>

                <span>Nombre propuesto: {solicitud.nombreEspacio}</span>
                <span>Fecha de ingreso: {formatDate(solicitud.fechaIngreso, true)}</span>
                    
                <span>Descripción: {solicitud.descripcion}</span>
                <span>Justificación: {solicitud.justificacion}</span>
                <span>Dirección: {solicitud.direccion}</span>
                <div class="mb-2 mt-2">
                    <span class="text-s">Ubicación:</span>
                    <MapDisplay latitude={solicitud.latitud} longitude={solicitud.longitud} marked={{x: solicitud.latitud, y: solicitud.longitud}} zoom={14} disableMarking/>
                </div>
            </div>
            <div class="flex flex-col gap-2 flex-1">
                <span>Histórico de estados:</span>
                <div class="ml-4 flex flex-col gap-2">
                    {#each solicitud.SEPEstado as estado}
                        <div class="flex flex-col gap-1">
                            <span>{estado.nombre}</span>                            
                            <span>Fecha: {formatDate(estado.fechaHoraDesde, true)}</span>
                            <div class="flex justify-between items-start">
                                <span>Responsable: 
                                <img src={estado.responsable.urlFotoPerfil} alt="Foto de perfil" on:click={() => goto('/Perfil/' + estado.responsable.username)} class="w-12 h-12 rounded-full"/>
                                {estado.responsable.nombre} {estado.responsable.apellido} (@{estado.responsable.username})</span>
                            </div>
                            <span>{estado.descripcion}</span>
                        </div>
                    {/each}
                </div>
                <Button action={() => popupCambiarEstadoVisible = true}>Realizar cambio de estado</Button>
            </div>
        </div>
        <div class="w-full flex justify-center items-center gap-2 mt-4">
            <Button action={() => popupDetalleVisible = false}>Cerrar</Button>
            <Button action={() => goto(`/AdministrarDenunciasEventos/${solicitud?.idSEP}`)}>Generar Espacio a partir de la Solicitud</Button>
        </div>
    </Popup>

    <Popup bind:visible={popupCambiarEstadoVisible} title="Cambiar de estado solicitud de espacio público" fitH fitW>
        <div class="flex flex-col md:flex-row gap-8 md:gap-4 items-start w-full h-fit mb-4">
            <div class="flex flex-col gap-2 flex-1">
                <span>Espacio vinculado: {solicitud.nombreEspacio}</span>
                
                <span>Solicitante: <img src={solicitud.solicitante.urlFotoPerfil} alt="Foto de perfil" on:click={() => goto('/Perfil/' + solicitud?.solicitante.username)} class="w-12 h-12 rounded-full"/>
                    {solicitud.solicitante.nombre} {solicitud.solicitante.apellido} (@{solicitud.solicitante.username})
                </span>
                <span>Nombre propuesto: {solicitud.nombreEspacio}</span>
                <span>Nuevo estado: <ComboBox classes="!md:w-[50%]" options={estadosOption} bind:selected={estadoSeleccionado} placeholder="Seleccionar.." maxHeight={5}/></span>
                <TextField label="Descripción del espacio" multiline bind:value={solicitud.descripcion} rows={6} validate={validateDescripcion} forceValidate={warningDescripcionVisible}/>
            </div>
            
        </div>
        <div class="w-full flex justify-center items-center gap-2 mt-4">
            <Button action={() => popupCambiarEstadoVisible = false}>Cancelar</Button>
            <Button action={() => {cambiarEstadoSEP}}>Aceptar</Button>
        </div>
    </Popup>
{/if}

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para ver espacios.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>

<!-- agregar modal de cambios de estado
 agregar popup de selección única para espacio
 agregar botón para crear uno nuevo
 agregar funcionalidad a botón de cambio de estado y de crear el espacio a partir de la solicitud
 agregar botón para seleccionar espacio vinculado-->