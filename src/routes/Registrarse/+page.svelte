<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import DatePicker from "$lib/components/DatePicker.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTORegistrarse from "$lib/dtos/usuarios/DTORegistrarse";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";

    
    $: repeatPassword = ""

    function validateNombre(nombre: string) {
        if (nombre.trim().length === 0) {
            return {
                valid: false,
                reason: "Debe ingresar el nombre"
            }
        }
    
        return {
            valid: true,
            reason: undefined
        }
    }
    function validateApellido(apellido: string) {
        if (apellido.trim().length === 0) {
            return {
                valid: false,
                reason: "Debe ingresar el apellido"
            }
        }
    
        return {
            valid: true,
            reason: undefined
        }
    }

    $: usernameDisponible = true;
    $: usernameValid = false;
    function validateUsername(username: string, preventRequest = false) {
        username = username.trim();
        if (username.length === 0) {
            usernameValid = false;
            return {
                valid: false,
                reason: "Debe ingresar el nombre de usuario"
            }
        }

        if (/\s/g.test(username)) {
            usernameValid = false;
            return {
                valid: false,
                reason: "No puede contener espacios"
            }
        }

        if (!/^[a-zA-Z0-9\-]+$/.test(username)) {
            usernameValid = false;
            return {
                valid: false,
                reason: "Solo debe tener letras mayúsculas, minúsculas, números y guiones"
            }
        }
        
        if (!preventRequest) {
            (async () => {
                usernameDisponible = (await UsuariosService.verificarUsernameDisponible(username));
            })();
        }
        

        usernameValid = true;
        return {
            valid: true,
            reason: ""
        };
    }
    function validateDNI(dni: string) {
        let val = dni.trim()
        if (val.length === 0) {
            return {
                valid: false,
                reason: "Debe ingresar el DNI"
            }
        }

        if (val.length < 8 || val.length > 9 || !/^[[0-9]{8,9}$/.test(val)) {
            return {
                valid: false,
                reason: "Verifique el DNI ingresado"
            }
        }
    
        return {
            valid: true,
            reason: undefined
        }
    }
    function validateFechaNacimiento(fecha: Date | null) {
        if (fecha === null) {
            return {
                valid: false,
                reason: "Debe ingresar la fecha de nacimiento"
            }
        }

        fecha = new Date(fecha);

        let today = new Date();
        var age = today.getFullYear() - fecha.getFullYear();
        var m = today.getMonth() - fecha.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < fecha.getDate())) {
            age--;
        }
        

        if (age < 18) {
            return {
                valid: false,
                reason: "Debe ser mayor de 18 años"
            }
        }
    
        return {
            valid: true,
            reason: undefined
        }
    }

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


    let data : DTORegistrarse = {
		nombre: "",
		apellido: "",
		username: "",
		dni: "",
		fechaNacimiento: new Date("2000-01-02"),
		mail: "",
		password: ""
	};
    $: data;

    $: registracionError = ""

    $: completado = false

    $: (() => {
        if (
            validateNombre(data.nombre).valid
            && validateApellido(data.apellido).valid
            && validateUsername(data.username, true).valid
            && validateDNI(data.dni).valid
            && validateFechaNacimiento(data.fechaNacimiento).valid
            && validateMail(data.mail).valid
            && validatePassword(data.password).valid
            && data.password.trim() === repeatPassword.trim()
        ) {
            completado = true;
        } else {
            completado = false;
        }
    })()

    async function registrarse() {
        try {
            await UsuariosService.registrarse(data);
            goto("/Registrarse/Codigo")
        } catch(e) {
            if (e instanceof HttpError) {
                registracionError = e.message
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
            Registrarse
        </h1>
    </div>
    <div class="flex flex-col items-center justify-center md:justify-start w-[90vw] sm:w-[70vw] md:w-[40vw] md:h-screen overflow-y-auto overflow-x-hidden md:p-4">
        <TextField label="Nombre" bind:value={data.nombre} classes="w-full" validate={validateNombre} disableLinearDisplay max={50}/>
        <TextField label="Apellido" bind:value={data.apellido} classes="w-full" validate={validateApellido} disableLinearDisplay max={50}/>
        <TextField label="Nombre de usuario" bind:value={data.username} classes="w-full" validate={validateUsername} disableLinearDisplay max={50}/>
        <Warning text="No disponible, pruebe con otro" visible={usernameValid && !usernameDisponible}/>
        <TextField label="DNI N.°" bind:value={data.dni} classes="w-full" validate={validateDNI} disableLinearDisplay min={8} max={9}/>
        <DatePicker label="Fecha de nacimiento" bind:value={data.fechaNacimiento} classes="w-full" validate={validateFechaNacimiento} disableLinearDisplay width="100%"/>
        <TextField label="Correo electrónico" bind:value={data.mail} placeholder="mail@example.com" classes="w-full" validate={validateMail} disableLinearDisplay max={200}/>
        <TextField label="Contraseña" bind:value={data.password} classes="w-full" isPassword validate={validatePassword} disableLinearDisplay max={50}/>
        <div class="text-left w-full">
            Requisitos:
            <ul class="list-disc pl-8">
                <li>8 caracteres o más</li>
                <li>1 mayúscula</li>
                <li>1 minúscula</li>
                <li>1 número</li>
            </ul>     
        </div>
        <TextField label="Repetir contraseña:" bind:value={repeatPassword} classes="w-full" isPassword disableLinearDisplay max={50}/>
        <div class="flex w-full">
            <Warning text={"Las contraseñas no son iguales"} visible={data.password.trim() !== repeatPassword.trim()}/>
        </div>
        <div class="flex w-full">
            <Warning text={registracionError} visible={registracionError !== ""}/>

        </div>
        <div class="flex justify-center gap-2">
            <Button action={() => {goto("/")}}>Cancelar</Button>
            <Button action={registrarse} disabled={!completado}>Aceptar</Button>
        </div>
        <p class="text-center mt-4 mb-4">
            ¿Ya tenés una cuenta?
            <a href="/">Iniciar Sesión</a>
        </p>
        <hr class="border border-dark w-full m-2 mb-4"/>
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