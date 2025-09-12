<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupBusquedaUsuarios from "$lib/components/PopupBusquedaUsuarios.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOModificarGrupo from "$lib/dtos/grupos/DTOModificarGrupo";
	import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";
	import { HttpError } from "$lib/request/request";
	import { GruposService } from "$lib/services/GruposService";
	import { permisos, token, username } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let tipoPorDefecto : {id: number, nombre: string} | null = null;
    let tiposOpciones : Map<number, string> = new Map();
    let listo = false;

    let id = Number(page.params.id);

    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("CreacionGrupos")) {
            goto("/MisGrupos")
        }

        try {
            data = await GruposService.obtenerDatosModificarGrupo(id);
            data.participantes.forEach(p => {
                if (p.username === get(username)) return;
                participantes.push({
					data: {
						username: p.username,
						nombre: p.nombre,
						apellido: p.apellido,
						mail: null,
						dni: null,
						fechaNacimiento: null
					},
					tipo: p.tipo
				})
            })
            participantes = [...participantes];
            data.participantes = [];
            

            let tiposParticipante = await GruposService.obtenerTiposUsuarioGrupo();
            tiposParticipante.forEach(t => {
                tiposOpciones.set(t.id, t.nombre);
            })
            tiposOpciones = new Map(tiposOpciones);            

            let aux = tiposParticipante.filter(t => t.nombre === "Miembro");
            if (aux.length > 0) {
                tipoPorDefecto = aux[0];
            } else {
                error = "No se encontró el tipo 'Miembro'"
                errorVisible = true
            }
            
            listo = true;
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
    });

    let data : DTOModificarGrupo = {
		nombre: "",
		descripcion: "",
		participantes: [],
		id: 0
	}

    function validateNombre(val: string) {
        if (val.trim() === "") {
            return {
                valid: false,
                reason: "Es obligatorio ingresar un nombre para el grupo"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }

    $: warningNombreVisible = false;
    $: warningParticipantesVisible = false;

    $: error = ""
    $: errorVisible = false

    $: popupExitoVisible = false

    async function modificarGrupo() {
        if (data.nombre === "") {
            warningNombreVisible = true;
            return;
        } else {
            warningNombreVisible = false;
        }
        
        if (participantes.length === 0) {
            warningParticipantesVisible = true;
            return;
        } else {
            warningParticipantesVisible = false;
        }

        participantes.forEach(p => {
            data.participantes.push({
				username: p.data.username,
				tipo: p.tipo,
                nombre: p.data.nombre,
                apellido: p.data.apellido
			})
        })

        try {
            await GruposService.modificarGrupo(data);
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
        
    }

    $: usuario = null as null | DTOBusquedaUsuario;
	$: popupBusquedaUsuariosVisible = false;
	async function buscarUsuarios(valor: string) {
		let ret = await GruposService.buscarUsuariosParaAgregar(id, valor);
        ret = ret.filter(u => !participantes.some(p => p.data.username === u.username));
        ret = ret.filter(u => u.username !== get(username));
        return ret;
	}

    let participantes : {data: DTOBusquedaUsuario, tipo: number}[] = []

    $: completado = validateNombre(data.nombre).valid && participantes.length > 0;

    $: (() => {      
        if (usuario === null) return;
        if (tipoPorDefecto === null) return;
        participantes.push({
			data: usuario,
			tipo: tipoPorDefecto.id
		});
        participantes = [...participantes];
        usuario = null;
    })()

    function eliminarParticipante(username: string) {
        participantes = participantes.filter(p => p.data.username !== username);
    }    

    $: (() => {
        warningParticipantesVisible = participantes.length === 0
    })()


</script>
            

<div id="content">
    {#if listo}
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m text-center">
            Modificar grupo
        </h1>

        <TextField label="Nombre del grupo" bind:value={data.nombre} validate={validateNombre} forceValidate={warningNombreVisible} min={1} max={50}/>

        <TextField label="Descripción del grupo" multiline bind:value={data.descripcion} rows={6} max={100}/>

        <div class="flex justify-start gap-2 items-center">
            <span class="text-m">Participantes</span>
            <Button icon="/icons/plus.svg" action={() => popupBusquedaUsuariosVisible = true}></Button>
        </div>
        <div class="flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-16">
            {#each participantes as p}
                <div class="flex justify-between items-start gap-2">
                    <div class="flex flex-col gap-2 justify-start items-start">
                        <span>{p.data.nombre} {p.data.apellido}</span>
                        <ComboBox options={tiposOpciones} bind:selected={p.tipo}/>
                    </div>
                    <Button icon="/icons/cross.svg" action={() => eliminarParticipante(p.data.username)}></Button>
                </div>
            {/each}
        </div>
        <Warning visible={warningParticipantesVisible} text="No se han agregado miembros. Debe agregar al menos uno"/>

    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button classes="text-m" action={() => {goto(`/Grupo/${id}`)}}>Cancelar</Button>
        <Button classes="text-m" action={modificarGrupo} disabled={!completado}>Guardar</Button>
    </div>
    {/if}
</div>

<PopupBusquedaUsuarios searchFunction={buscarUsuarios} bind:selected={usuario} bind:visible={popupBusquedaUsuariosVisible}/>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Grupo modificado exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/Grupo/${id}`)}}>Aceptar</Button>
    </div>
</Popup>