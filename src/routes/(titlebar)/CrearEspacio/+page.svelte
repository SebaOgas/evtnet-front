<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import Button from "$lib/components/Button.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
    import TextField from "$lib/components/TextField.svelte";
    import Warning from "$lib/components/Warning.svelte";
    import FilePicker from "$lib/components/FilePicker.svelte";
	import type DTOCrearEspacio from "$lib/dtos/espacios/DTOCrearEspacio";
	import { HttpError } from "$lib/request/request";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { permisos, token, username, vinculadoMP } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import type { DTOSubespacio } from "$lib/dtos/espacios/DTOCrearEspacio";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import { UsuariosService } from "$lib/services/UsuariosService";

    let previousPage: string = base;

	afterNavigate(({from}) => {
		previousPage = from?.url.pathname || previousPage
	});

    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("CreacionEspaciosPrivados")) {
            goto("/Espacios")
        }
    });

    let data : DTOCrearEspacio = {
		nombre: "",
		descripcion: "",
		direccion: "",
		latitud: undefined,
		longitud: undefined,
		esPublico: false,
		sepId: null,
        subEspacios: [],
        username: "",
        requiereAprobarEventos: false
	}

    let subespacio : DTOSubespacio = {
        nombre: "",
        descripcion: "",
        capacidadMaxima: 1,
        disciplinas: []
    }

    let indiceSubespacio : number = -1;

    let ubicacion : {x: number, y: number} | undefined = undefined

    $: popupDisciplinasVisible = false;
    $: popupSubespacioVisible = false;
    $: confirmarVisible = false;
    $: warningNombreSubespacioVisible = false;
    $: warningCapacidadMaximaVisible = false;
    let title = "Nuevo subespacio";  

    // Global map to store all discipline names for display
    let todasLasDisciplinas : Map<number, string> = new Map<number, string>();
    // Temporary map for current subespacio being edited
    let disciplinasDelSubespacio : Map<number, string> = new Map<number, string>();
    
    let documentacionFiles: File[] = [];
    let basesYCondicionesFile: File | null = null;
    let requiereAprobacionEventos = false;

    function cerrar() {
        disciplinasDelSubespacio = new Map();
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
        indiceSubespacio = -1;
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
            // Collect IDs from selected disciplines
            const disciplinasIds: number[] = [];
            disciplinasDelSubespacio.forEach((_, key) => disciplinasIds.push(key));

            // Assign to subespacio
            subespacio.disciplinas = [...disciplinasIds];

            // Merge to global map for display
            disciplinasDelSubespacio.forEach((value, key) => {
                todasLasDisciplinas.set(key, value);
            });
            todasLasDisciplinas = new Map(todasLasDisciplinas);

            if (indiceSubespacio !== -1 && indiceSubespacio >= 0 && indiceSubespacio < data.subEspacios.length) {
                data.subEspacios[indiceSubespacio] = { ...subespacio };
            } else {
                data.subEspacios.push({ ...subespacio });
            }

            data.subEspacios = [...data.subEspacios];

            cerrar();
        }
    }


    async function buscarDisciplinas(val: string) {
        let response = await DisciplinasService.buscar(val);

        let ret : Map<number, string> = new Map();

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

    $: warningNombreVisible = false;
    $: warningDireccionVisible = false;
    $: warningUbicacionVisible = false;
    $: warningDocumentacionVisible = false;

    $: error = ""
    $: errorVisible = false

    $: popupExitoVisible = false
    $: espacioId = -1;

    async function crearEspacio() {
        if (data.nombre === "") {
            warningNombreVisible = true;
        } else {
            warningNombreVisible = false;
        }

        if (data.direccion === "") {
            warningDireccionVisible = true;
        } else {
            warningDireccionVisible = false;
        }

        if (ubicacion === undefined) {
            warningUbicacionVisible = true;
        } else {
            warningUbicacionVisible = false;
        }

        if(documentacionFiles.length === 0) {
            warningDocumentacionVisible = true;
        } else {
            warningDocumentacionVisible = false;
        }

        if (
            data.nombre === ""
            || data.direccion === ""
            || ubicacion === undefined
            || documentacionFiles.length === 0
        ) {return}

        data.latitud = ubicacion.x;
        data.longitud = ubicacion.y;
        data.esPublico = false;
        data.requiereAprobarEventos = requiereAprobacionEventos;
        data.username = get(username);

        try {
            espacioId = await EspaciosService.crearEspacio(data, basesYCondicionesFile, documentacionFiles);
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
        
    }

    async function vincularMP() {
        let link = await UsuariosService.obtenerLinkIntegrarMP();        
        window.location.href = link;
    }

</script>


            

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m text-center">
            Crear espacio
        </h1>

        <TextField label="Nombre del espacio" bind:value={data.nombre} validate={validateNombre} forceValidate={warningNombreVisible}/>

        <TextField label="Descripción del espacio" multiline bind:value={data.descripcion} rows={6} max={500}/>

        <TextField label="Dirección" bind:value={data.direccion} validate={validateDireccion} forceValidate={warningDireccionVisible} max={150}/>
        <div class="mb-2 mt-2">
            Ubicación
            <MapDisplay latitude={-32.89084} longitude={-68.82717} bind:marked={ubicacion} zoom={12}/>
            <Warning text="La ubicación es obligatoria" visible={warningUbicacionVisible}/>
        </div>

        <div class="mb-2 mt-2">
            <div class="flex gap-2 relative md:flex-row items-center">
                <span class="md:items-center gap-2">Documentación</span> 
                <FilePicker bind:files={documentacionFiles} multiple label="" />
                <Button classes="text-xs info_documentacion min-w-[30px] font-bold">i</Button> 
                <Warning text="La documentación es obligatoria" visible={warningDocumentacionVisible}/>
            </div>          
            <div class="flex gap-2 relative md:flex-row items-center">                
                <span class="md:items-center gap-2  mt-3 mb-2">Bases y Condiciones</span>
                <FilePicker bind:file={basesYCondicionesFile} label="" placeholder=""/>
            </div> 
        
            <CheckBox bind:checked={requiereAprobacionEventos}>Requiere Aprobación de Eventos</CheckBox>    
        </div>
        
        <h2 class="text-m text-center flex justify-center items-center gap-2">
            <span>SubEspacios</span>
            <Button classes="text-xs info_subespacios min-w-[30px] font-bold">i</Button>
        </h2>
        <div class="mb-2 mt-2">
            <div class="flex flex-col gap-2">
                {#each data.subEspacios as se,i}
                    <div>
                        <div>{se.nombre}</div>
                        <div>Capacidad máxima: {se.capacidadMaxima}</div>
                        <div>Disciplinas: {
                            se.disciplinas
                                .map((d) => {
                                    const nombre = todasLasDisciplinas.get(d);
                                    return nombre ? nombre : d;
                                })
                                .filter(Boolean)
                                .join(", ")
                        }</div>
                        <div class="flex gap-2 ">
                            <Button icon="/icons/edit.svg" classes="ml-1" action={() => {
                                popupSubespacioVisible = true; 
                                indiceSubespacio = i; 
                                subespacio = {...se};
                                // Load existing disciplines for this subespacio
                                disciplinasDelSubespacio = new Map();
                                se.disciplinas.forEach(id => {
                                    const nombre = todasLasDisciplinas.get(id);
                                    if (nombre) {
                                        disciplinasDelSubespacio.set(id, nombre);
                                    }
                                });
                            }}></Button>
                            <Button icon="/icons/cross.svg" classes="ml-1" action={() => {
                                data.subEspacios.splice(i, 1);
                                data.subEspacios = [...data.subEspacios];
                            }}></Button>    
                        </div>                    
                    </div>
                {/each}
            </div>           
        </div>
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button classes="text-s" action={() => {
            disciplinasDelSubespacio = new Map();
            popupSubespacioVisible = true;
        }}>Agregar Subespacio</Button>
        
    </div>
    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        
        <Button classes="text-s" action={() => {goto(previousPage)}}>Cancelar</Button>
        <Button classes="text-s" disabled={data.subEspacios.length === 0} action={crearEspacio}>Aceptar</Button>
    </div>

</div>

<Popup bind:title={title} bind:visible={popupSubespacioVisible} classes="z-40" fitH fitW>

    <div class="h-full grow">
        <TextField label="Nombre del subespacio" bind:value={subespacio.nombre} validate={validateNombre} forceValidate={warningNombreSubespacioVisible}/>
        <TextField label="Descripción del subespacio" multiline bind:value={subespacio.descripcion} rows={6} max={500}/>
        <TextField label="Capacidad máxima" min={1} bind:value={subespacio.capacidadMaxima} validate={validateCapacidadMaxima} forceValidate={warningCapacidadMaximaVisible}/>
        <div class="flex justify-start gap-2">
            <span>Disciplinas</span>
            <Button action={() => {popupDisciplinasVisible = !popupDisciplinasVisible}}>Seleccionar</Button>
        </div>
        <div class="commaList">
            {#each disciplinasDelSubespacio as d}
                <span>{d[1]}</span>
            {/each}
        </div>
    </div>
    
    
    <div class="flex justify-center items-center w-full gap-2 mt-8">
        <Button action={cerrar}>Cancelar</Button>
        <Button action={confirmar} disabled={subespacio.nombre === "" || subespacio.capacidadMaxima === 0}>Confirmar</Button>
    </div>
</Popup>


<PopupSeleccion title="Selección múltiple" multiple={true} bind:visible={popupDisciplinasVisible} searchFunction={buscarDisciplinas} bind:selected={disciplinasDelSubespacio} classes="z-40"/>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Espacio registrado exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/Espacio/${espacioId}`)}}>Aceptar</Button>
    </div>
</Popup>

{#if !get(vinculadoMP)}
    <Popup title="Vincular a Mercado Pago" visible={true} fitH fitW>
        <p>Su cuenta de evtnet no está vinculada a Mercado Pago. Esto es necesario para que pueda cobrar por los eventos que se organicen en sus espacios.</p>
        <div class="flex justify-center items-center w-full gap-2">
            <Button action={() => goto(previousPage)}>Cancelar</Button>
            <Button action={vincularMP}>Vincular</Button>
        </div>
    </Popup>
{/if}