<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { HttpError } from "$lib/request/request";
	import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import { onMount } from "svelte";
	import Popup from "$lib/components/Popup.svelte";
	import { page } from "$app/state";
	import type DTOModificarParametro from "$lib/dtos/parametros/DTOModificarParametro.ts";
	import type DTOParametro from "$lib/dtos/parametros/DTOParametro";
	import { ParametroService } from "$lib/services/ParametroService";

	$: errorPermiso = false;
	$: errorVisible = false;
	$: error = "";
    $: exitoVisible = false;
	
	$: id = parseInt(page.params.id === undefined ? "0" : page.params.id);

	$: data = {
		id: id,
		nombre: "",
		valor:"",
	} as DTOModificarParametro;

	let original : DTOParametro = {
		id: id,
		nombre: "",
		valor: ""
	};

	let listo = false;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionParametros")) {
			errorPermiso = true;
			return;
		}

		try{
            original = await ParametroService.obtenerParametroCompleto(id);
			
            data.id = original.id;
            data.nombre = original.nombre;
            data.valor = original.valor;
        }catch(e){
            if(e instanceof HttpError){
                error = e.message;
                errorVisible = true;
            }
        }
		listo = true;
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

	
	$: completado = (
		validateNombre(data.nombre).valid
	);

	async function guardar() {
		
		try {
			await ParametroService.modificarParametro(data);
            exitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	}

	function cancelar() {
		goto("/AdministrarParametrizacion");
	}
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow md:grow-0">
		<h1 class="text-m text-center md:text-start">Modificar Parámetro</h1>

		{#if listo}
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
                label="Valor" 
                bind:value={data.valor} 
                classes="w-full"
                max={100}
            />
		</div>
		{/if}
    </div>
        

	<div class="flex gap-2 h-fit p-2 justify-center items-center md:justify-start">
		<Button classes="text-m" action={cancelar}>Cancelar</Button>
		<Button classes="text-m" action={guardar} disabled={!completado}>Guardar</Button>
	</div>
</div>


<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para modificar Parámetros.
</PopupError>

<Popup bind:visible={exitoVisible} fitH fitW>
	<span>
        Parámetro modificado exitosamente.
    </span>
    <div class="flex w-full justify-center">
        <Button action={() => goto("/AdministrarParametrizacion")}>Aceptar</Button>
    </div>
</Popup>