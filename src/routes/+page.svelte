<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    onMount(() => {
        if (get(token) !== "") {
            goto("/Perfil");
        }
    }) 
    

    function validateMail(mail: string) {
        let regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        let valid : boolean = true;
        let reason = null;

        let validMail = regex.test(mail.toLowerCase())
        
        if (!validMail) {
            if (/\s/g.test(mail) || !/^[a-zA-Z0-9\-]+$/.test(mail)) {
                valid = false;
                reason = "Formato incorrecto"
            }
        }

        return {
            valid: valid,
            reason: reason
        }
    }

    $: mail = ""
    $: password = ""

    $: inicioSesionError = ""

    async function iniciarSesion() {
        try {
            await UsuariosService.iniciarSesion(mail, password);
            goto("/Eventos")
        } catch(e) {
            if (e instanceof HttpError) {
                inicioSesionError = e.message
            }
        }
    }
</script>
<div class="flex flex-col md:flex-row md:gap-30 items-center justify-center h-screen p-1">
    <div class="flex flex-col items-center justify-center">
        <div class="logo flex flex-col justify-center items-center w-[194px] md:w-[300px]">
            <img src="logo.png" alt="Logo" class="object-contain"/>
            <span class="text-xl font-bold text-light">evtnet</span>
        </div>
        <h1 class="text-m m-2">
            Iniciar Sesión
        </h1>
    </div>
    <div class="flex flex-col items-center justify-center w-[90vw] sm:w-[70vw] md:w-[40vw]">
        <TextField label="Usuario" bind:value={mail} placeholder="Nombre de usuario o correo electrónico" classes="w-full" validate={validateMail} disableLinearDisplay/>
        <TextField label="Contraseña" bind:value={password} classes="w-full" isPassword disableLinearDisplay/>
        <div class="flex w-full">
            <Warning text={inicioSesionError} visible={inicioSesionError !== ""}/>

        </div>
        <div class="flex justify-center">
            <Button action={iniciarSesion}>Aceptar</Button>
        </div>
        <p class="text-center">
            ¿No tenés una cuenta?
            <a href="./Registrarse">Registrarse</a>
        </p>
        <p class="text-center">
            <a href="./RecuperarContrasena">Olvidé mi contraseña</a>
        </p>
        <hr class="border border-dark w-full m-2"/>
        <div class="flex justify-center">
            <Button classes="bg-white border border-black"><img src="icons/google.svg" alt=""/><span class="text-black">Continuar con Google</span></Button>
        </div>
    </div>
    
</div>

<style>
    .logo {
        user-select: none;
    }
</style>