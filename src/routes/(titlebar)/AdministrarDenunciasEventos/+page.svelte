<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import Table, { type Row } from "$lib/components/Table.svelte";
	import TableCell from "$lib/components/TableCell.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import type DTOBusquedaDenunciasEventos from "$lib/dtos/eventos/DTOBusquedaDenunciasEventos";
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

    let listo = false;

    let rows : Row[] = [];

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
            rows = [];
            tmp.content.forEach(d => {
                rows.push({
                    titulo: d.titulo,
                    denunciante: "@" + d.usernameDenunciante,
                    evento: d.nombreEvento,
                    organizador: "@" + d.usernameOrganizador,
                    estado: d.estado,
                    cambio: timeSince(d.fechaHoraUltimoCambio),
                    ingreso: formatDate(d.fechaHoraIngreso, true),
                    acciones: aux
                });
            })
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

    let fechaCambioEstadoDesde: Date | null = filtros.fechaCambioEstadoDesde;
    let fechaCambioEstadoHasta: Date | null = filtros.fechaCambioEstadoHasta;

    let ordenOpciones : Map<string, string> = new Map<string, string>();

    ordenOpciones.set("FECHA_DENUNCIA_ASC", "Fecha de denuncia (ascendente)");
    ordenOpciones.set("FECHA_DENUNCIA_DESC", "Fecha de denuncia (descendente)");
    ordenOpciones.set("FECHA_CAMBIO_ESTADO_ASC", "Fecha de cambio de estado (ascendente)");
    ordenOpciones.set("FECHA_CAMBIO_ESTADO_DESC", "Fecha de cambio de estado (descendente)");

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

    let aux : TableCell;
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

            <Table columns={[
                {
					label: "Título",
					key: "titulo"
				},
                {
					label: "Denunciante",
					key: "denunciante"
				},
                {
					label: "Evento",
					key: "evento"
				},
                {
					label: "Organizador",
					key: "organizador"
				},
                {
					label: "Estado",
					key: "estado"
				},
                {
					label: "Último cambio hace",
					key: "cambio"
				},
                {
					label: "Ingresado",
					key: "ingreso"
				},
                {
					label: "Acciones",
					key: "acciones"
				},
            ]} rows={rows}/>

            <TableCell bind:this={aux}>
                <div class="flex gap-2 justify-center items-center w-full">
                    <Button icon="/icons/view.svg"></Button>
                    <Button icon="/icons/edit.svg"></Button>
                </div>
            </TableCell>

            

        {/if}
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-end">
        Componente de paginación
    </div>

</div>