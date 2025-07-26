<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";

    import {page} from "$app/state"
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";

    $: codigo = ""
    $: mail = page.params.mail;
    $: password = ""

    $: repeatPassword = ""
    
    $: error = ""
    $: errorVisible = false

    function validatePassword(password: string) {

        if (password.trim().length === 0) {
            return {
                valid: false,
                reason: "Debe ingresar la contraseña"
            }
        }

        let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/

        let valid : boolean = regex.test(password)

        let reason = null;
        
        if (!valid) {
            reason = "Formato incorrecto"
        }

        return {
            valid: valid,
            reason: reason
        }
    }

    $: popupExitoVisible = false;

    async function recuperarContrasena() {
        if (password.trim() !== repeatPassword.trim()) {
            error = "Las contraseñas no son iguales"
            errorVisible = true
            return;
        }

        try {
            await UsuariosService.recuperarContrasena(mail, password, codigo);
            popupExitoVisible = true;
        } catch(e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }            
        }
    }

    async function enviarCodigo() {
        try {
            await UsuariosService.enviarCodigoRecuperarContrasena(mail);
        } catch(e) {
            if (e instanceof HttpError) {
                error = e.message
            }
        }
    }
</script>

<div class="flex flex-col md:flex-row md:gap-30 items-center justify-start md:justify-center min-h-screen p-1 pt-10 pb-10">
    <div class="flex flex-col items-center justify-center">
        <div class="logo flex flex-col justify-center items-center w-[194px] md:w-[300px]">
            <img src="/logo.png" alt="Logo" class="object-contain"/>
            <span class="text-xl font-bold text-light">evtnet</span>
        </div>
        <h1 class="text-m m-2">
            Recuperar contraseña
        </h1>
    </div>
    <div class="flex flex-col items-center justify-center w-[90vw] sm:w-[70vw] md:w-[40vw]">
        <TextField label="Código:" bind:value={codigo} classes="w-full" disableLinearDisplay max={6}/>
        <TextField label="Ingrese su nueva contraseña:" bind:value={password} classes="w-full" isPassword validate={validatePassword} disableLinearDisplay max={50}/>
        <div class="text-left w-full">
            Requisitos:
            <ul class="list-disc pl-8">
                <li>8 caracteres o más</li>
                <li>1 mayúscula</li>
                <li>1 minúscula</li>
                <li>1 número</li>
            </ul>     
        </div><TextField label="Repetir contraseña:" bind:value={repeatPassword} classes="w-full" isPassword disableLinearDisplay max={50}/>
        <div class="flex w-full">
            <Warning text={"Las contraseñas no son iguales"} visible={password.trim() !== repeatPassword.trim()}/>
        </div>
        <div class="flex flex-col items-center justify-center gap-2">
            <Button classes="text-lg" action={recuperarContrasena}>Aceptar</Button>
            <Button classes="text-md" action={enviarCodigo}>Reenviar código</Button>
        </div>
    </div>
    
</div>

<Popup title={"Éxito"} bind:visible={popupExitoVisible} fitH fitW>
    Contraseña modificada exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto("/Perfil")}}>Aceptar</Button>
    </div>
</Popup>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<style>
    .logo {
        user-select: none;
    }
</style>