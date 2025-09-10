<script lang="ts">
    /*
        Made with help from Claude
    */
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import DatePicker from "$lib/components/DatePicker.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import type DTOAltaUsuario from "$lib/dtos/usuarios/DTOAltaUsuario";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import { onMount } from "svelte";
	import Warning from "$lib/components/Warning.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import type DTORol from "$lib/dtos/usuarios/DTORol";
	import type DTOAltaRol from "$lib/dtos/usuarios/DTOAltaRol";
	import CheckBox from "$lib/components/CheckBox.svelte";

	$: errorPermiso = false;
	$: errorVisible = false;
	$: error = "";
    $: exitoVisible = false;

	$: data = {
		nombre: "",
		descripcion: "",
		reservado: false,
		permisos: []
	} as DTOAltaRol;


	$: permisosSeleccionados = new Map<string, string>();
	$: popupPermisosVisible = false;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		if (!get(permisos).includes("AdministracionUsuarios")) {
			errorPermiso = true;
			return;
		}

		
	});

	function validateNombre(nombre: string) {
		nombre = nombre.trim();
		if (nombre.length === 0) {
			return {
				valid: false,
				reason: "Es obligatorio ingresar el nombre"
			};
		}
		if (nombre.length > 50) {
			return {
				valid: false,
				reason: "Máximo 50 caracteres"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	async function searchPermisos(val: string) {
        try {
			const response = await UsuariosService.obtenerPermisos();
            let ret: Map<string, string> = new Map();
            response.forEach((item) => {
                if (permisosSeleccionados.get(item.nombre) === undefined) {
                    ret.set(item.nombre, item.nombre);
                }
            });
            return ret;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
            return new Map<number, string>();
		}
	}

	$: completado = (
		validateNombre(data.nombre).valid
	);

	async function guardar() {
		data.permisos = Array.from(permisosSeleccionados.keys());
		
		try {
			await UsuariosService.altaRol(data);
            exitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	}

	function cancelar() {
		goto("/AdministrarUsuarios");
	}

	let minDate = new Date();
	minDate.setFullYear(minDate.getFullYear() - 100);

	let maxDate = new Date();
	maxDate.setFullYear(maxDate.getFullYear() - 18);
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow md:grow-0">
		<h1 class="text-m text-center md:text-start">Alta de Usuario</h1>
		
        <div class="flex flex-col gap-2 overflow-y-auto grow w-full md:max-w-[1000px]">
            <TextField 
                label="Nombre" 
                bind:value={data.nombre} 
                classes="w-full" 
                validate={validateNombre}
                forceValidate
                max={50}
            />

            <TextField 
                label="Descripción"
                multiline 
                bind:value={data.descripcion} 
                classes="w-full"
                max={100}
            />

            <CheckBox bind:checked={data.reservado}>Reservado</CheckBox>

            <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                    Permisos:
                    <Button 
                        classes="w-fit" 
                        action={() => {popupPermisosVisible = true}}
                    >
                        Agregar
                    </Button>
                </div>
                <div class="flex flex-col gap-2">
                    {#each permisosSeleccionados as [id, nombre]}
                        <div class="flex gap-2 items-center">
                            <span>
                                {nombre}
                            </span>
                            <Button icon="/icons/cross.svg" action={() => {permisosSeleccionados.delete(id); permisosSeleccionados = new Map(permisosSeleccionados)}}></Button>
                        </div>
                    {/each}
                </div>
                <Warning visible={permisosSeleccionados.size === 0} text="Se recomienda seleccionar al menos un permiso"></Warning>
            </div>
        </div>
    </div>
        

	<div class="flex gap-2 h-fit p-2 justify-center items-center md:justify-start">
		<Button classes="text-m" action={cancelar}>Cancelar</Button>
		<Button classes="text-m" action={guardar} disabled={!completado}>Guardar</Button>
	</div>
</div>

<PopupSeleccion 
	title="Selección de permisos" 
	multiple={true} 
	bind:visible={popupPermisosVisible} 
	searchFunction={searchPermisos} 
	bind:selected={permisosSeleccionados}
    noSearch
    forceReSearch
    fitH
    fitW
/>

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para dar de alta roles.
</PopupError>

<Popup bind:visible={exitoVisible} fitH fitW>
	<span>
        Rol añadido exitosamente. 
    </span>
    <div class="flex w-full justify-center">
        <Button action={() => goto("/AdministrarRoles")}>Aceptar</Button>
    </div>
</Popup>