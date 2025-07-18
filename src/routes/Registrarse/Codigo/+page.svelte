<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    onMount(() => {
        if (!get(permisos).includes("HabilitarCuenta")) {
            goto("/Registrarse")
        }
    })
    

    $: codigo = ""
    $: registracionError = ""

    $: completado = false

    $: (() => {
        if (
            codigo.trim().length === 6 && /^[0-9]{6}$/.test(codigo)
        ) {
            completado = true;
        } else {
            completado = false;
        }
    })()

    async function ingresarCodigo() {
        let resp: void;
        try {
            resp = await UsuariosService.ingresarCodigo(codigo);
            goto("/Eventos")
        } catch(e) {
            if (e instanceof HttpError) {
                registracionError = e.message
               
            }            
        }
    }

    async function enviarCodigo() {
        try {
            await UsuariosService.enviarCodigo();
        } catch(e) {
            if (e instanceof HttpError) {
                registracionError = e.message
            }
        }
    }
</script>

<div class="flex flex-col md:flex-row md:gap-30 items-center justify-center h-screen p-1 pt-10 pb-10">
    <div class="flex flex-col items-center justify-center">
        <div class="logo flex flex-col justify-center items-center w-[194px] md:w-[300px]">
            <img src="/logo.png" alt="Logo" class="object-contain"/>
            <span class="text-xl font-bold text-light">evtnet</span>
        </div>
        <h1 class="text-m m-2">
            Ingresar Código
        </h1>
    </div>
    <div class="flex flex-col items-center justify-center w-[90vw] sm:w-[70vw] md:w-[40vw]">
        <TextField label="Código" bind:value={codigo} classes="w-full" disableLinearDisplay max={6}/>
        <div class="flex w-full">
            <Warning text={registracionError} visible={registracionError !== ""}/>

        </div>
        <div class="flex flex-col items-center justify-center gap-2">
            <Button classes="text-lg" action={ingresarCodigo} disabled={!completado}>Aceptar</Button>
            <Button classes="text-md" action={enviarCodigo}>Reenviar código</Button>
        </div>
    </div>
    
</div>

<style>
    .logo {
        user-select: none;
    }
</style>