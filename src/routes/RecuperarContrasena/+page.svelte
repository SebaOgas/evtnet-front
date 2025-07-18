<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import DatePicker from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTORegistrarse from "$lib/dtos/usuarios/DTORegistrarse";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";

    function validateMail(mail: string) {

        if (mail.trim().length === 0) {
            return {
                valid: false,
                reason: "Debe ingresar el correo electrónico"
            }
        }
        
        let regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        let valid : boolean = regex.test(mail.toLowerCase())

        let reason = null;
        
        if (!valid) {
            reason = "Formato incorrecto"
        }

        return {
            valid: valid,
            reason: reason
        }
    }

    
    $: mail = "";

    $: error = ""

    $: popupErrorVisible = false;

    async function continuar() {
        if (!validateMail(mail).valid) {
            popupErrorVisible = true;
            return;
        }

        try {
            await UsuariosService.enviarCodigoRecuperarContrasena(mail);
            goto("/RecuperarContrasena/" + mail)
        } catch(e) {
            if (e instanceof HttpError) {
                error = e.message
            }
        }
    }
</script>

<div class="flex flex-col md:flex-row items-center justify-center md:justify-between h-full md:h-screen md:max-h-screen p-1 pt-10 pb-10">
    <div class="flex flex-col items-center justify-center md:p-[5vw] box-content">
        <div class="logo flex flex-col justify-center items-center w-[194px] md:w-[300px]">
            <img src="logo.png" alt="Logo" class="object-contain"/>
            <span class="text-xl font-bold text-light">evtnet</span>
        </div>
        <h1 class="text-m m-2">
            Recuperar contraseña
        </h1>
    </div>
    <div class="flex flex-col items-center justify-center w-[90vw] sm:w-[70vw] md:w-[40vw] md:h-screen overflow-y-auto overflow-x-hidden md:p-4">
        <TextField label="Ingrese el correo electrónico asociado a su cuenta:" bind:value={mail} placeholder="mail@example.com" classes="w-full" validate={validateMail} disableLinearDisplay max={200}/>
        <div class="flex w-full">
            <Warning text={error} visible={error !== ""}/>
        </div>
        <div class="flex justify-center gap-2">
            <Button action={() => {goto("/")}}>Cancelar</Button>
            <Button action={continuar}>Continuar</Button>
        </div>
    </div>
    
</div>

<PopupError bind:visible={popupErrorVisible}>
    Verifique que la dirección de correo electrónica ingresada sea correcta
</PopupError>

<style>
    .logo {
        user-select: none;
    }
</style>