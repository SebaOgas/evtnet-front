<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import type DTOSuperEvento from "$lib/dtos/eventos/DTOSuperEvento";
	import { HttpError } from "$lib/request/request";
	import { loading, permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
    import type DTORegistro from "$lib/dtos/registros/DTORegistro";
	import { RegistrosService } from "$lib/services/RegistrosService";
	import type DTOFiltrosRegistro from "$lib/dtos/registros/DTOFiltrosRegistro";
	import Table, { exportarCSV } from "$lib/components/Table.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";


    let previousPage: string = base;

	afterNavigate(({from}) => {
		previousPage = from?.url.pathname || previousPage
	});

	$: errorPermiso = false;
    $: errorGenerico = ""
	$: errorGenericoVisible = false

    $: tipo = page.params.tipo;
    let tipoFormat : string = "";

    let permisosList : string[] = [];

    $: tipos = [] as string[]
    $: subtipos = [] as string[]

    $: listo = false;

    onMount(async () => {
        if (get(token) === "") {
            goto("/");
        }

        switch (tipo) {
            case "UsuariosGrupos":
                tipoFormat = "Usuarios y Grupos"
                break;
            case "Eventos":
            case "Espacios":
            case "Pagos":
                tipoFormat = tipo;
                break;
            case "Parametros":
                tipoFormat = "Parámetros"
                break;
            default:
                errorPermiso = true;
                return;
        }

        permisosList = get(permisos);

        if(!permisosList.includes(`VisionLog${tipo}`)) {
            errorPermiso = true;
            return;
        }

        try {
            loading.set(true);
            tipos = await RegistrosService.obtenerTipos(tipo);

            tipos.forEach(t => {
                selectedTipos.set(t, t);
            })

            selectedTipos = new Map(selectedTipos);

            subtipos = await RegistrosService.obtenerSubtipos(tipo);

            subtipos.forEach(t => {
                selectedSubtipos.set(t, t);
            })

            selectedSubtipos = new Map(selectedSubtipos);

            listo = true;
        } catch (e) {
            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			} 
        } finally {
            loading.set(false);
        }
    })

    let lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    $: filtros = {
        tipos: [],
		subtipos: [],
		fechaHoraDesde: lastWeek,
		fechaHoraHasta: new Date(),
		usuarios: []
    } as DTOFiltrosRegistro;
    $: resultados = [] as DTORegistro[]

    async function buscar() {
        if (tipo === undefined) return;
        
        filtros.tipos = [];
        selectedTipos.forEach(t => {
            filtros.tipos.push(t);
        })
        
        filtros.subtipos = [];
        selectedSubtipos.forEach(t => {
            filtros.subtipos.push(t);
        })

        try {
            resultados = await RegistrosService.buscar(tipo, filtros)
        } catch (e) {
            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			} 
        }
    }

    let raw : string[][] = [];


    $: popupTiposVisible = false;

    async function searchTipos(val: string) {
        let m : Map<string, string> = new Map<string, string>();

       tipos.forEach(t => {
            m.set(t, t);
       })
       
        return m;
    }

    let selectedTipos : Map<string, string> = new Map<string, string>();

    $: popupSubtiposVisible = false;

    async function searchSubtipos(val: string) {
        let m : Map<string, string> = new Map<string, string>();

       subtipos.forEach(t => {
            m.set(t, t);
       })
       
        return m;
    }

    let selectedSubtipos : Map<string, string> = new Map<string, string>();

    
</script>

<PopupSeleccion title="Seleccionar tipos" noSearch forceReSearch multiple={true} bind:visible={popupTiposVisible} searchFunction={searchTipos} bind:selected={selectedTipos}/>
<PopupSeleccion title="Seleccionar subtipos" noSearch forceReSearch multiple={true} bind:visible={popupSubtiposVisible} searchFunction={searchSubtipos} bind:selected={selectedSubtipos}/>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center md:text-start">
			Registro de {tipoFormat}
		</h1>

        {#if listo}
        <div class="flex flex-col md:flex-row gap-2 md:justify-between md:items-end">
            <div class="flex flex-col gap-2 justify-start items-start">
                <div class="flex flex-col md:flex-row gap-2 md:gap-8">
                    <div class="flex gap-2 justify-start items-baseline">
                        <span>
                            Tipo:
                            <span class="commaList">
                                {#each selectedTipos as t}
                                    <span>{t[1]}</span>
                                {/each}
                            </span>
                        </span>
                        <Button action={() => {popupTiposVisible = !popupTiposVisible}}>Seleccionar</Button>
                    </div>
                    <div class="flex gap-2 justify-start items-baseline">
                        <span>
                            Subtipo:
                            <span class="commaList">
                                {#each selectedSubtipos as s}
                                    <span>{s[1]}</span>
                                {/each}
                            </span>
                        </span>
                        <Button action={() => {popupSubtiposVisible = !popupSubtiposVisible}}>Seleccionar</Button>
                    </div>
                </div>
                <DatePicker label="Rango de fechas" range time bind:startDate={filtros.fechaHoraDesde} bind:endDate={filtros.fechaHoraHasta} maxDate={new Date()} classes="w-full"/>
            </div>
            <div class="flex gap-2">
                <Button action={buscar}>Filtrar</Button>
                {#if resultados.length > 0}
                    <Button action={() => exportarCSV(raw, `Registro de ${tipoFormat} leído el ${formatDate(new Date(), true)}`)}>Exportar</Button>
                {/if}
            </div>
        </div>

        {#if resultados.length > 0}
            <Table bind:raw={raw} cols={["Tipo", "Subtipo", "Fecha y Hora", "Usuario", "Solicitud HTTP", "Descripción"]}>
                {#each resultados as r}
                    <tr>
                        <td>{r.tipo}</td>
                        <td>{r.subtipo}</td>
                        <td>{formatDate(r.fechaHora, true)}</td>
                        <td class="!text-wrap">{r.usuario.nombre} {r.usuario.apellido} @{r.usuario.username}</td>
                        <td class="!text-wrap !text-start">{r.solicitud}</td>
                        <td class="!text-wrap !text-start">{r.descripcion}</td>
                    </tr>
                {/each}
            </Table>
        {/if}
        {/if}
    </div>
</div>


<PopupError bind:visible={errorPermiso}>
	No tiene permiso para acceder a ver este registro.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>