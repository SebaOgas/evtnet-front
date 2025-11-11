<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import Table from "$lib/components/Table.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import type DTOBusquedaDenunciasEventos from "$lib/dtos/eventos/DTOBusquedaDenunciasEventos";
	import type DTODenunciaEventoCompleta from "$lib/dtos/eventos/DTODenunciaEventoCompleta";
	import type DTODenunciaEventoSimple from "$lib/dtos/eventos/DTODenunciaEventoSimple";
	import { HttpError } from "$lib/request/request";
	import { EventosService } from "$lib/services/EventosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    let filtros : DTOBusquedaDenunciasEventos = {
        texto: "",
        estados: [],
        fechaIngresoDesde: null,
        fechaIngresoHasta: null,
        fechaCambioEstadoDesde: null,
        fechaCambioEstadoHasta: null,
        orden: "FECHA_DENUNCIA_ASC"
    }
    
    let page = 0;
    let lastPage = 0;
    $: page, buscar();

    let listo = false;

    let resultados : DTODenunciaEventoSimple[] = [];

    let estados = [] as {id: number, nombre: string, checked: boolean}[]

    onMount(async () => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionDenunciasEventos")) {
			errorPermiso = true;
			return;
		}

        try {
			estados = await EventosService.obtenerEstadosDenuncias();
            estados.forEach((e, i, arr) => {
                if (e.nombre !== "Finalizado") {
                    arr[i].checked = true;
                } else {
                    arr[i].checked = false;
                }
            })

            listo = true;
            buscar();
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    })


    async function buscar() {
        filtros.estados = [];

        estados.forEach(e => {
            if (e.checked) {
                filtros.estados.push(e.id);
            }
        })

        filtros.fechaIngresoDesde = fechaIngresoDesde;
        filtros.fechaIngresoHasta = fechaIngresoHasta;
        filtros.fechaCambioEstadoDesde = fechaCambioEstadoDesde;
        filtros.fechaCambioEstadoHasta = fechaCambioEstadoHasta;

        try {
			let tmp = await EventosService.buscarDenuncias(filtros, page);
            lastPage = tmp.totalPages - 1;
            resultados = tmp.content;
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
    maxDate.setDate(maxDate.getDate() + 2);

    let fechaIngresoDesde: Date | null = filtros.fechaIngresoDesde;
    let fechaIngresoHasta: Date | null = filtros.fechaIngresoHasta;

    let fechaCambioEstadoDesde: Date | null = filtros.fechaCambioEstadoDesde;
    let fechaCambioEstadoHasta: Date | null = filtros.fechaCambioEstadoHasta;

    let ordenOpciones : Map<string, string> = new Map<string, string>();

    ordenOpciones.set("FECHA_DENUNCIA_ASC", "Fecha de ingreso (ascendente)");
    ordenOpciones.set("FECHA_DENUNCIA_DESC", "Fecha de ingreso (descendente)");
    ordenOpciones.set("FECHA_CAMBIO_ESTADO_DESC", "Último cambio de estado (ascendente)");
    ordenOpciones.set("FECHA_CAMBIO_ESTADO_ASC", "Último cambio de estado (descendente)");

    function timeSince(date: Date | number) {
        const now = new Date();
        date = new Date(date);
        let diff = Math.floor((now.getTime() - date.getTime()) / 1000); // difference in seconds

        const days = Math.floor(diff / (3600 * 24));
        diff -= days * 3600 * 24;

        const hours = Math.floor(diff / 3600);
        diff -= hours * 3600;

        const minutes = Math.floor(diff / 60);

        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0 || days > 0) result += `${hours}h `;
        result += `${minutes}min`;

        return result.trim();
    }

    $: popupDetalleVisible = false;
    let denuncia : DTODenunciaEventoCompleta | null = null;


    async function mostrarDenuncia(denunciaSimple: DTODenunciaEventoSimple) {
        try {
			denuncia = await EventosService.obtenerDenuncia(denunciaSimple.idDenuncia);
            popupDetalleVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}            
		}
    }

    function formatUser(denunciante: { nombre: string; apellido: string; username: string; mail: string; }, parentheses: boolean) {
        if (parentheses) {
            return `${denunciante.nombre} ${denunciante.apellido} @${denunciante.username} (${denunciante.mail})`;
        } else {
            return `${denunciante.nombre} ${denunciante.apellido} @${denunciante.username} ${denunciante.mail}`;
        }
    }
</script>



<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m text-center">
            Denuncias a eventos
        </h1>

        {#if listo}
            <div class="flex w-full gap-2 items-center">
                <TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={filtros.texto} action={buscar}></TextField>
                <Button icon="/icons/search.svg" action={buscar} classes="h-fit"></Button>
            </div>
            
            <div class="flex w-full flex-wrap gap-2">
                {#each estados as e}
                    <div class="flex justify-start items-center gap-2">
                        <CheckBox bind:checked={e.checked}><span class="whitespace-nowrap">{e.nombre}</span></CheckBox>
                    </div>
                {/each}
            </div>

            <DatePicker 
                range 
                label="Denuncias ingresadas entre:" 
                bind:startDate={fechaIngresoDesde} 
                bind:endDate={fechaIngresoHasta}
                {minDate}
                {maxDate}
                classes="!md:w-[70%]"
            />

            <DatePicker 
                range 
                label="Cambio de estado más reciente entre:" 
                bind:startDate={fechaCambioEstadoDesde} 
                bind:endDate={fechaCambioEstadoHasta}
                {minDate}
                {maxDate}
                classes="!md:w-[70%]"
            />

            <div class="flex flex-col md:flex-row justify-start md:items-center gap-2">
                <span>
                    Orden: 
                </span>
                <ComboBox classes="!md:w-[50%]" options={ordenOpciones} bind:selected={filtros.orden} placeholder="a" maxHeight={5}/>
            </div>

            <Table cols={["Título", "Denunciante", "Evento", "Organizador", "Estado", "Último cambio hace", "Ingresado", "Acciones"]} classes="[&_tr_td]:md:text-ellipsis [&_tr_td]:md:max-w-[300px] [&_tr_td]:md:overflow-hidden">
                {#each resultados as d}
                    <tr>
                        <td>{d.titulo}</td>
                        <td>@{d.usernameDenunciante}</td>
                        <td>{d.nombreEvento}</td>
                        <td>@{d.usernameOrganizador}</td>
                        <td>{d.estado}</td>
                        <td>{timeSince(d.fechaHoraUltimoCambio)}</td>
                        <td>{formatDate(d.fechaHoraIngreso, true)}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg" action={() => mostrarDenuncia(d)}></Button>
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarDenunciasEventos/${d.idDenuncia}`)}></Button>
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


{#if denuncia !== null}
    <Popup bind:visible={popupDetalleVisible} title="Detalle de Denuncia a Evento" fitH fitW>
        <div class="flex flex-col md:flex-row gap-8 md:gap-4 items-start w-full h-fit mb-4">
            <div class="flex flex-col gap-2 flex-1">
                <span>Denuncia: {denuncia.titulo}</span>
                <span class="text-justify">Descripción: {denuncia.descripcion}</span>
                <div class="flex justify-between items-start">
                    <span>Denunciante: {formatUser(denuncia.denunciante, true)}</span>
                    <Button classes="whitespace-nowrap" action={() => goto(`/Perfil/${denuncia?.denunciante.username}`)}>Ver usuario</Button>
                </div>
                <span>Histórico de estados:</span>
                <div class="ml-4 flex flex-col gap-2">
                    {#each denuncia.historico as estado}
                        <div>
                            <span>{estado.nombre} ({formatDate(estado.fechaHoraDesde, true)}) ({formatUser(estado.responsable, false)}):</span>
                            <div class="ml-4">{estado.descripcion}</div>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="flex flex-col gap-2 flex-1">
                <div class="flex justify-between items-start">
                    <span>Evento: {denuncia.evento.nombre}</span>
                    <Button classes="whitespace-nowrap" action={() => goto(`/Evento/${denuncia?.evento.id}`)}>Ver evento</Button>
                </div>
                <span class="text-justify">Descripción del evento: {denuncia.evento.descripcion}</span>
                <span>Espacio: 
                    {#if denuncia.evento.espacio.nombre === null}
                        {denuncia.evento.espacio.direccion}
                    {:else}
                        {denuncia.evento.espacio.nombre} ({denuncia.evento.espacio.direccion})
                    {/if}
                </span>
                <span>Inicio y fin: {formatDate(denuncia.evento.fechaHoraInicio, true)} - {formatDate(denuncia.evento.fechaHoraFin, true)}</span>
                <span>Cantidad de participantes: {denuncia.evento.participantes}</span>
                <div class="flex justify-between items-start">
                    <span>Organizador: {formatUser(denuncia.evento.organizador, true)}</span>
                    <Button classes="whitespace-nowrap" action={() => goto(`/Perfil/${denuncia?.evento.organizador.username}`)}>Ver usuario</Button>
                </div>
                <span>Administradores</span>
                <div class="ml-4 flex flex-col gap-2">
                    {#each denuncia.evento.administradores as admin}
                        <div class="flex justify-between items-start">
                            <span>{formatUser(admin, false)}</span>
                            <Button classes="whitespace-nowrap" action={() => goto(`/Perfil/${admin.username}`)}>Ver usuario</Button>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
        <div class="w-full flex justify-center items-center gap-2">
            <Button action={() => popupDetalleVisible = false}>Atrás</Button>
            <Button action={() => goto(`/AdministrarDenunciasEventos/${denuncia?.id}`)}>Realizar cambio de estado</Button>
        </div>
    </Popup>
{/if}


<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para editar usuarios.
</PopupError>