<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount, tick } from "svelte";
	import { get } from "svelte/store";
	import { SolicitudEspacioService } from "$lib/services/SolicitudEspacioService";
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
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOCambioEstadoSEP from "$lib/dtos/espacios/DTOCambioEstadoSEP";
	import type DTOEspacioPrivadoCompleto from "$lib/dtos/espacios/DTOEspacioPrivadoCompleto";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    $: popupExitoVisible = false;

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

    let estados = [] as {id: number, nombre: string, checked: boolean}[];

    $: estadoSeleccionado=0;
    $: descripcionCambioEstado="";

    let minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    let maxDate = new Date();

    let fechaIngresoDesde: Date | null = filtros.fechaIngresoDesde;
    let fechaIngresoHasta: Date | null = filtros.fechaIngresoHasta;

    let fechaCambioEstadoDesde: Date | null = filtros.fechaUltimoCambioEstadoDesde;
    let fechaCambioEstadoHasta: Date | null = filtros.fechaUltimoCambioEstadoHasta;

    let solicitud : DTOEspacioPrivadoCompleto | null = null;
    $: idsolicitud = 0;

    $: popupDetalleVisible = false;
    $: popupCambiarEstadoVisible = false;

    $: buscarPorUbicacion = false;
    $: popupUbicacionVisible = false;
    let ubicacion : {x: number, y: number} | undefined;
    let rango : number;

    let espacios : Map<number, string> = new Map<number, string>();

    let estadosOption : Map<number, string> = new Map<number, string>();
    
    let estadosPosiblesOption : Map<number, string> = new Map<number, string>();

    $: warningDescripcionVisible = false;
    $: warningEstadoVisible = false;

    $: if (popupCambiarEstadoVisible && idsolicitud>0) {
        setearEstadosPosibles();
    }

    onMount(async () => {
		if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionEspaciosPrivados")) {
			errorPermiso = true;
			return;
		}

        try {
			estados = await SolicitudEspacioService.obtenerEstadosSEPrivados();
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
			let response = await SolicitudEspacioService.buscarSolicitudesEspaciosPrivados(filtros, page);
            resultados=response.content;
            lastPage = response.totalPages -1;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function mostrarSolicitud(solicitudSimple:DTOResultadoBusquedaSEP){
        solicitud={
            nombreEspacio: solicitudSimple.nombreEspacio,
            fechaIngreso: solicitudSimple.fechaIngreso,
            descripcion: "",
            direccion: "",
            latitud: 0,
            longitud: 0,
            justificacion: "",
            idEspacio: solicitudSimple.idEspacio,
            solicitante: {
                username: "",
                nombre: "",
                apellido: "",
                email: "",
                urlFotoPerfil: null
            },
            sepEstados: []
        }

        try {
            solicitud = await SolicitudEspacioService.obtenerDetalleSolicitudEPrivado(solicitudSimple.idSEP);
            popupDetalleVisible = true;
            
        } catch (e) {
            
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        }
    }

    async function setearEstadosPosibles() {
        if (!solicitud) return;

        try {
            estadosOption = new Map<number, string>();
            solicitud.estadosPosibles.forEach(e => {
                estadosPosiblesOption.set(e.id, e.nombre);
            });
            //estadosPosiblesOption.set(solicitud.espacioEstados[solicitud.espacioEstados.length-1].idEstado, solicitud.espacioEstados[solicitud.espacioEstados.length-1].nombre);
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }   
        }
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

        if (!solicitud || descripcionCambioEstado === "" || descripcionCambioEstado.length < 50) {
            warningDescripcionVisible = true;
        } else {
            warningDescripcionVisible = false;
        }
        if (!estadoSeleccionado || estadoSeleccionado === 0) {
            warningEstadoVisible = true;
        } else {
            warningEstadoVisible = false;
        }
        if ((estadoSeleccionado && estadoSeleccionado === 0) || (!solicitud || descripcionCambioEstado === "" || descripcionCambioEstado.length < 50)) {return}

        

        try {
            let cambioEstado: DTOCambioEstadoSEP = {
                idSEP: solicitud!.idEspacio,
                idEstado: estadoSeleccionado,
                descripcion: descripcionCambioEstado
            }
            await SolicitudEspacioService.cambiarEstadoSEPrivado(cambioEstado);
            popupExitoVisible=true;
            buscar();
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }   
        }
        popupCambiarEstadoVisible = false;
        popupDetalleVisible = false;
    }

    async function descargarDocumentacionEP(idEspacio:number){
        try {
            await SolicitudEspacioService.descargarDocumentacionEP(idEspacio);
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }   
        }
    }
    
</script>

<PopupUbicacion bind:visible={popupUbicacionVisible} max={100000} bind:ubicacion={ubicacion} bind:radius={rango}/>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="w-full text-m flex justify-center md:justify-start items-center gap-2">
            <span>Solicitudes de Espacio Privado</span>
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

    <Popup bind:visible={popupDetalleVisible} title="Solicitud de Espacio Privado" fitH fitW>
        {#if solicitud}
        <div class="flex flex-col md:flex-row gap-8 md:gap-4 items-start w-full h-fit mb-4">
            <div class="flex flex-col gap-2 flex-1">            
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <div class="flex justify-start items-center">
                    <span>Solicitante:</span>
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <img src={solicitud.solicitante.urlFotoPerfil} alt="Foto de perfil" on:click={() => goto('/Perfil/' + solicitud?.solicitante.username)} class="w-12 h-12 rounded-full cursor-pointer"/>
                    <span>{solicitud.solicitante.nombre} {solicitud.solicitante.apellido} (@{solicitud.solicitante.username})</span>
                </div>
                
                <span class="text-justify">Nombre propuesto: {solicitud.nombreEspacio}</span>
                <span class="text-justify">Fecha de ingreso: {formatDate(solicitud.fechaIngreso, true)}</span>
                    
                <span>Descripción: {solicitud.descripcion}</span>
                <span>Dirección: {solicitud.direccion}</span>
                <div class="mb-2 mt-2">
                    <span class="text-s">Ubicación del espacio</span>
                    <MapDisplay latitude={solicitud.latitud} longitude={solicitud.longitud} marked={{x: solicitud.latitud, y: solicitud.longitud}} zoom={14} disableMarking/>
                </div>
                <div class="flex flex-col gap-2 flex-1">
                    <span>Documentación:</span>
                    <div class="ml-1 flex flex-col gap-2">
                        {#each solicitud.documentacion as documento}
                            <div>
                                <span>{documento.nombreArchivo}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2 flex-1">
                <span>Histórico de estados:</span>
                <div class="ml-1 flex flex-col gap-2">
                    {#each solicitud.espacioEstados as estado}
                        <div>
                            <span>{estado.nombre}</span>                            
                            <span>Fecha: {formatDate(estado.fechaHoraDesde, true)}</span>
                            <span>{estado.descripcion}</span>
                        </div>
                    {/each}
                </div>
                <div><Button classes="whitespace-nowrap" action={() => {popupCambiarEstadoVisible = true; estadoSeleccionado=solicitud?.espacioEstados[solicitud.espacioEstados.length-1].id; idsolicitud=solicitud.idEspacio}}>Realizar cambio de estado</Button></div>
            </div>
        </div>
        <div class="w-full flex justify-center items-center gap-2 mt-4">
            <Button action={() => popupDetalleVisible = false}>Cerrar</Button>
            <Button action={() => descargarDocumentacionEP(solicitud.idEspacio)}>Descargar documentación</Button>
        </div>
        {:else}
            <div class="p-4 text-center">Cargando solicitud...</div>
        {/if}
    </Popup>

    <Popup bind:visible={popupCambiarEstadoVisible} title="Cambiar de estado solicitud de espacio privado" fitH fitW>
        {#if solicitud}
        <div class="flex flex-col md:flex-row gap-8 md:gap-4 items-start w-full h-fit mb-4">
            <div class="flex flex-col gap-2 flex-1 w-full">                
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <span>Solicitante: <img src={solicitud.solicitante.urlFotoPerfil} alt="Foto de perfil" on:click={() => goto('/Perfil/' + solicitud?.solicitante.username)} class="w-12 h-12 rounded-full"/>
                    {solicitud.solicitante.nombre} {solicitud.solicitante.apellido} (@{solicitud.solicitante.username})
                </span>
                <span>Nombre propuesto: {solicitud.nombreEspacio}</span>
                <span>Nuevo estado: <ComboBox classes="!md:w-[50%]" options={estadosPosiblesOption} bind:selected={estadoSeleccionado} placeholder="Seleccionar.." maxHeight={5}/>
                                    <Warning text="Debe seleccionar el nuevo estado en el que estará la solicitud" visible={warningEstadoVisible}/>
                </span>
                <span>Descripción del cambio <TextField label="" multiline bind:value={descripcionCambioEstado} rows={6} validate={validateDescripcion} forceValidate={warningDescripcionVisible} max={100}/></span>
            </div>
            
        </div>
        <div class="w-full flex justify-center items-center gap-2 mt-4">
            <Button action={() => popupCambiarEstadoVisible = false}>Cancelar</Button>
            <Button action={cambiarEstadoSEP}>Aceptar</Button>
        </div>
        {:else}
            <div class="p-4 text-center">Cargando...</div>
        {/if}
    </Popup>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para ver espacios.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Estado de espacio actualizado exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {popupExitoVisible=false}}>Aceptar</Button>
    </div>
</Popup>