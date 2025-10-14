<script lang="ts">
    /*
        Built with assistance from Claude
    */
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import ComboBox from "$lib/components/ComboBox.svelte";
    import DatePicker from "$lib/components/DatePicker.svelte";
    import Warning from "$lib/components/Warning.svelte";
    import Popup from "$lib/components/Popup.svelte";
    import PopupError from "$lib/components/PopupError.svelte";
    import { token, permisos } from "$lib/stores";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { page } from "$app/state";
    import { CronogramaService } from "$lib/services/CronogramaService";
    import { HttpError } from "$lib/request/request";
    import { formatDate } from "$lib/components/DatePicker.svelte";
    import type DTODatosCreacionExcepcion from "$lib/dtos/espacios/DTODatosCreacionExcepcion";

    $: errorPermiso = false;
    $: espacioId = Number(page.params.id);
    $: cronogramaId = Number(page.params.cronogramaId);
    $: idSubEspacio = Number(page.url.searchParams.get("idSubEspacio")) || 0;

    $: listo = false

    $: data = {
        nombreEspacio: "",
        fechaDesde: new Date(),
        fechaHasta: new Date(),
        tiposExcepcion: []
    } as DTODatosCreacionExcepcion;

    $: errorGenerico = "";
    $: errorGenericoVisible = false;
    $: popupExitoVisible = false;
    $: creandoExcepcion = false;

    // Form fields
    $: fechaDesdeExcepcion = null as Date | null;
    $: fechaHastaExcepcion = null as Date | null;
    $: tipoExcepcionSeleccionado = undefined as number | undefined;

    // Force validation states
    $: warningFechasVisible = false;
    $: warningTipoVisible = false;

    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Convert tipos to Map for ComboBox
    $: tiposMap = new Map<number, string>();
    $: {      
        tiposMap.clear();
        data.tiposExcepcion.forEach(tipo => {
            tiposMap.set(tipo.id, tipo.nombre);
        });
        tiposMap = tiposMap; // Trigger reactivity
        
        // Set default to "Completa" if available
        if (tipoExcepcionSeleccionado === undefined) {
            const completaType = data.tiposExcepcion.find(t => t.nombre === "Completa");
            if (completaType) {
                tipoExcepcionSeleccionado = completaType.id;
            }
        }
    }

    function validateFechas(desde: Date | null, hasta: Date | null) {
        if (desde === null || hasta === null) {
            warningFechasVisible = true;
            return {
                valid: false,
                reason: "Es obligatorio ingresar el rango de fechas"
            };
        }

        warningFechasVisible = false;
        return {
            valid: true,
            reason: undefined
        };
    }

    function validateTipo(tipo: number | undefined) {
        if (tipo === undefined) {
            warningTipoVisible = true;
            return {
                valid: false,
                reason: "Seleccione el tipo de excepción"
            };
        }
        warningTipoVisible = false;
        return {
            valid: true,
            reason: undefined
        };
    }

    async function confirmarCreacion() {
        // Reset validation
        warningFechasVisible = false;
        warningTipoVisible = false;

        let hasErrors = false;

        // Validate all fields
        const fechasValid = validateFechas(fechaDesdeExcepcion, fechaHastaExcepcion);
        if (!fechasValid.valid) {
            hasErrors = true;
        }

        const tipoValid = validateTipo(tipoExcepcionSeleccionado);
        if (!tipoValid.valid) {
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        creandoExcepcion = true;

        try {
            await CronogramaService.crearExcepcion(
                cronogramaId, 
                fechaDesdeExcepcion!, 
                fechaHastaExcepcion!, 
                tipoExcepcionSeleccionado!
            );
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        } finally {
            creandoExcepcion = false;
        }
    }

    function cancelar() {
        goto(`/Espacio/${espacioId}/AdministrarCronograma/${cronogramaId}/Excepciones`);
    }

    onMount(async () => {
        if (get(token) === "") {
            goto("/");
        }

        if (!get(permisos).includes("AdministracionEspaciosPrivados")) {
            errorPermiso = true;
            return;
        }

        try {
            data = await CronogramaService.obtenerDatosCreacionExcepcion(cronogramaId);
            listo = true;
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        }
    });
</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        {#if listo}
        <h1 class="text-s text-center">Crear excepción</h1>
        <h2 class="text-m text-center">{data.nombreEspacio}</h2>
        <h3 class="text-s text-center">Cronograma</h3>
        <p class="text-s text-center">
            Del {formatDate(data.fechaDesde)} al {formatDate(data.fechaHasta)}
        </p>

        <div class="mt-4">
            <span class="text-xs">Fechas</span>
            <DatePicker 
                range 
                time
                label=""
                bind:startDate={fechaDesdeExcepcion} 
                bind:endDate={fechaHastaExcepcion}
                minDate={Math.max(new Date(data.fechaDesde).getTime(), tomorrow.getTime())}
                maxDate={data.fechaHasta}
                validate={validateFechas}
            />
        </div>

        <div>
            <span class="text-xs">Tipo de excepción</span>
            <ComboBox 
                options={tiposMap} 
                bind:selected={tipoExcepcionSeleccionado} 
                placeholder="Completa"
                change={() => validateTipo(tipoExcepcionSeleccionado)}
                maxHeight={5}
            />
            <Warning text="Seleccione el tipo de excepción" visible={warningTipoVisible} />
        </div>
        {/if}
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={cancelar}>Cancelar</Button>
        <Button action={confirmarCreacion} disabled={creandoExcepcion}>
            {creandoExcepcion ? "Creando..." : "Confirmar"}
        </Button>
    </div>
</div>

<Popup title="Excepción creada exitosamente" bind:visible={popupExitoVisible} fitH fitW>
    <div class="flex justify-center items-center w-full">
        <Button action={() => goto(`/Espacio/${espacioId}/AdministrarCronograma/${cronogramaId}/Excepciones?idSubEspacio=${idSubEspacio}`)}>
            Aceptar
        </Button>
    </div>
</Popup>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar cronogramas.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>