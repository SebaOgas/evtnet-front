<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";

	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";


    $: currentPassword = ""
    $: newPassword = ""

    $: repeatPassword = ""
    
    $: error = ""

    function validateCurrentPassword(password: string) {
        if (password.trim().length === 0) {
            return {
                valid: false,
                reason: "Debe ingresar la contraseña"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }

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

    async function restablecerContrasena() {
        try {
            await UsuariosService.restablecerContrasena(currentPassword, newPassword);
            popupExitoVisible = true;
        } catch(e) {
            if (e instanceof HttpError) {
                error = e.message
            }            
        }
    }
</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <TextField label="Contraseña actual:" bind:value={currentPassword} classes="w-full" isPassword validate={validateCurrentPassword} disableLinearDisplay max={50}/>
        <TextField label="Ingrese su nueva contraseña:" bind:value={newPassword} classes="w-full" isPassword validate={validatePassword} disableLinearDisplay max={50}/>
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
            <Warning text={"Las contraseñas no son iguales"} visible={newPassword.trim() !== repeatPassword.trim()}/>
        </div>
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={() => {goto("/Perfil")}}>Cancelar</Button>
        <Button action={restablecerContrasena}>Confirmar</Button>
    </div>
    
</div>

<Popup title={"Éxito"} bind:visible={popupExitoVisible} fitH fitW>
    Contraseña modificada exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto("/Perfil")}}>Aceptar</Button>
    </div>
</Popup>

<PopupError visible={error !== ""}>
    {error}
</PopupError>
