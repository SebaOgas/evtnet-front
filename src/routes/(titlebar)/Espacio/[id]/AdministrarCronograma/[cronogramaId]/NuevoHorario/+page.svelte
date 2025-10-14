<script lang="ts">
    /*
        Built with assistance from Claude
    */
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import ComboBox from "$lib/components/ComboBox.svelte";
    import TimeRangePicker from "$lib/components/TimeRangePicker.svelte";
    import TextField from "$lib/components/TextField.svelte";
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
    import type DTODatosCreacionHorario from "$lib/dtos/espacios/DTODatosCreacionHorario";

    $: errorPermiso = false;
    $: espacioId = Number(page.params.id);
    $: cronogramaId = Number(page.params.cronogramaId);
    $: idSubEspacio = Number(page.url.searchParams.get("idSubEspacio")) || 0;

    $: data = {
        nombreEspacio: "",
        fechaDesde: new Date(),
        fechaHasta: new Date(),
        comision: 0
    } as DTODatosCreacionHorario;

    $: errorGenerico = "";
    $: errorGenericoVisible = false;
    $: popupExitoVisible = false;
    $: creandoHorario = false;

    // Form fields
    $: diaSeleccionado = undefined as number | undefined;
    $: horaInicio = null as string | null;
    $: horaFin = null as string | null;
    $: precioTexto = "";
    $: precioAdicionalTexto = "";

    // Force validation states
    $: forceValidateHorario = false;
    $: forceValidatePrecio = false;
    $: warningDiaVisible = false;

    const diasSemana: Map<number, string> = new Map([
        [0, "Lunes"],
        [1, "Martes"],
        [2, "Miércoles"],
        [3, "Jueves"],
        [4, "Viernes"],
        [5, "Sábado"],
        [6, "Domingo"]
    ]);

    function validateDia(dia: number | undefined) {
        if (dia === undefined) {
            warningDiaVisible = true;
            return {
                valid: false,
                reason: "Seleccione el día de la semana"
            };
        }
        warningDiaVisible = false;
        return {
            valid: true,
            reason: undefined
        };
    }

    function validateHorario(inicio: string | null, fin: string | null) {
        if (!inicio || !fin) {
            return {
                valid: false,
                reason: "Seleccione el horario"
            };
        }
        if(inicio > fin) {
            return {
                valid: false,
                reason: "El horario de inicio debe ser anterior al de fin"
            };
        }
        if(inicio === fin) {
            return {
                valid: false,
                reason: "El horario de inicio y fin no pueden ser iguales"
            };
        }
        return {
            valid: true,
            reason: undefined
        };
    }

    function validatePrecio(precio: string) {
        if (precio.trim() === "") {
            return {
                valid: false,
                reason: "Ingrese el precio para organizar eventos en este horario"
            };
            
        }

        const numero = parseFloat(precio.replace(',', '.'));
        if (isNaN(numero) || numero < 0) {
            return {
                valid: false,
                reason: "El precio debe ser un número no negativo"
            };
        }

        return {
            valid: true,
            reason: undefined
        };
    }

    function validatePrecioAdicional(precio: string) {
        if (precio.trim() === "") {
            return {
                valid: false,
                reason: "Ingrese el precio adicional por inscripción"
            };
            
        }

        const numero = parseFloat(precio.replace(',', '.'));
        if (isNaN(numero) || numero < 0) {
            return {
                valid: false,
                reason: "El precio debe ser un número no negativo"
            };
        }

        return {
            valid: true,
            reason: undefined
        };
    }

    function calcularPrecioConComision(precioBase: number): number {
        return precioBase * (1 + data.comision);
    }

    function formatearPrecio(precio: number): string {
        return `$${precio.toFixed(2).replace('.', ',')}`;
    }

    async function confirmarCreacion() {
        // Reset force validation
        forceValidateHorario = false;
        forceValidatePrecio = false;
        warningDiaVisible = false;

        let hasErrors = false;

        // Validate all fields
        const diaValid = validateDia(diaSeleccionado);
        if (!diaValid.valid) {
            hasErrors = true;
        }

        const horarioValid = validateHorario(horaInicio, horaFin);
        if (!horarioValid.valid) {
            forceValidateHorario = true;
            hasErrors = true;
        }

        const precioValid = validatePrecio(precioTexto);
        if (!precioValid.valid) {
            forceValidatePrecio = true;
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        creandoHorario = true;

        try {
            // Convert time strings to Date objects
            const horaDesde = new Date();
            const [horaInicioH, horaInicioM] = horaInicio!.split(':');
            horaDesde.setHours(parseInt(horaInicioH), parseInt(horaInicioM), 0, 0);

            const horaHasta = new Date();
            const [horaFinH, horaFinM] = horaFin!.split(':');
            horaHasta.setHours(parseInt(horaFinH), parseInt(horaFinM), 0, 0);

            const precio = parseFloat(precioTexto.replace(',', '.'));
            const precioAdicional = parseFloat(precioAdicionalTexto.replace(',', '.')) || 0;

            await CronogramaService.crearHorario(cronogramaId, diaSeleccionado!, horaDesde, horaHasta, precio, precioAdicional);
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
            
        } finally {
            creandoHorario = false;
        }
    }

    function cancelar() {
        goto(`/Espacio/${espacioId}/AdministrarCronograma/${cronogramaId}?idSubEspacio=${idSubEspacio}`);
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
            data = await CronogramaService.obtenerDatosCreacionHorario(cronogramaId);
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
        <h1 class="text-s text-center">Crear horario</h1>
        <h2 class="text-m text-center">{data.nombreEspacio}</h2>
        <h3 class="text-s text-center">
            Cronograma
        </h3>
        <p class="text-s text-center">
            Del {formatDate(data.fechaDesde)} al {formatDate(data.fechaHasta)}
        </p>

        <div class="mt-4">
            <span class="text-xs">Día</span>
            <ComboBox 
                options={diasSemana} 
                bind:selected={diaSeleccionado} 
                placeholder="Seleccionar" 
                change={() => validateDia(diaSeleccionado)}
                maxHeight={7}
            />
            <Warning text="Seleccione el día de la semana" visible={warningDiaVisible} />
        </div>

        <div>
            <span class="text-xs">Horario</span>
            <TimeRangePicker 
                bind:startTime={horaInicio} 
                bind:endTime={horaFin} 
                label={null}
                validate={() => validateHorario(horaInicio, horaFin)}
            />
        </div>

        <div>
            <span class="text-xs">Precio para organizar eventos:</span>
            <div class="flex items-start gap-1 mt-1">
                <span class="mt-2 mb-2">$</span>
                <TextField 
                    label="" 
                    bind:value={precioTexto} 
                    placeholder="10000,00"
                    classes="flex-1"
                    validate={validatePrecio}
                    forceValidate={forceValidatePrecio}
                />
            </div>
            <!-- {#if precioTexto && validatePrecio(precioTexto).valid}
                <p class="text-xs mt-1">
                    Precio más comisión: {formatearPrecio(calcularPrecioConComision(parseFloat(precioTexto.replace(',', '.'))))}
                </p>
            {/if} -->
        </div>
        <div>
            <span class="text-xs">Precio adicional por inscripción:</span>
            <div class="flex items-start gap-1 mt-1">
                <span class="mt-2 mb-2">$</span>
                <TextField 
                    label="" 
                    bind:value={precioAdicionalTexto} 
                    placeholder="10000,00"
                    classes="flex-1"
                    validate={validatePrecioAdicional}
                    forceValidate={forceValidatePrecio}
                />
            </div>
        </div>
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={cancelar}>Cancelar</Button>
        <Button action={confirmarCreacion} disabled={creandoHorario}>
            {creandoHorario ? "Creando..." : "Confirmar"}
        </Button>
    </div>
</div>

<Popup title="Horario creado exitosamente" bind:visible={popupExitoVisible} fitH fitW>
    <div class="flex justify-center items-center w-full">
        <Button action={() => goto(`/Espacio/${espacioId}/AdministrarCronograma/${cronogramaId}?idSubEspacio=${idSubEspacio}`)}>
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