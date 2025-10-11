<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";

	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { permisos, token, username } from "$lib/stores";
	import { get } from "svelte/store";
	import { onMount } from "svelte";
	import DatePicker from "$lib/components/DatePicker.svelte";
	import type DTOEditarPerfil from "$lib/dtos/usuarios/DTOEditarPerfil";
	import FilePicker, { getImageFileDimensions } from "$lib/components/FilePicker.svelte";
	import Warning from "$lib/components/Warning.svelte";

    $: errorPermiso = false;

    $: data = {
		nombre: "",
		apellido: "",
		dni: "",
		fechaNacimiento: null,
		cbu: ""
    } as DTOEditarPerfil;


    onMount(async () => {
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("ModificacionPerfilPropio")) {
            errorPermiso = true;
            return;
        }

        try {
            data = await UsuariosService.obtenerPerfilParaEditar(get(username));
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
            }     
        }

    })

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

    function validateCBU(cbu: string) {
        let val = cbu.trim()
        if (val.length === 0) {
            return {
                valid: true,
                reason: undefined
            }
        }

        if (val.length !== 22 || !/^[[0-9]{22}$/.test(val)) {
            return {
                valid: false,
                reason: "Verifique el CBU ingresado"
            }
        }
    
        return {
            valid: true,
            reason: undefined
        }
    }

    $: errorTamanoFotoDePerfilVisible = false
    $: errorTamanoFotoDePerfil = ""

    function validateFotoDePerfil(file: File | null, preventRequest = false) {
        if (!preventRequest) {
            
            (async () => {
                if (file === null) {
                    errorTamanoFotoDePerfilVisible = false;
                    errorTamanoFotoDePerfil = "";
                    return
                }

                let dims = await getImageFileDimensions(file);               

                if (dims.h !== dims.w) {
                    errorTamanoFotoDePerfilVisible = true;
                    errorTamanoFotoDePerfil = "La foto de perfil debe ser cuadrada"
                    return
                }

                if (dims.h < 500) {
                    errorTamanoFotoDePerfilVisible = true;
                    errorTamanoFotoDePerfil = "La foto de perfil debe ser más grande (mayor a 500px de ancho y alto)"
                    return
                }
                errorTamanoFotoDePerfilVisible = false;
                errorTamanoFotoDePerfil = "";
        
            })();
        }

        if (file === null) {
            return {
                valid: true,
                reason: undefined
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }
    
    $: error = ""
    $: errorVisible = false

    $: popupExitoVisible = false;

    $: completado = false

    $: (async () => {
        if (
            validateNombre(data.nombre).valid
            && validateApellido(data.apellido).valid
            && validateDNI(data.dni).valid
            && validateFechaNacimiento(data.fechaNacimiento).valid
            && validateFotoDePerfil(fotoDePerfil, true).valid
            && !errorTamanoFotoDePerfilVisible
        ) {
            completado = true;
        } else {
            completado = false;
        }
        
    })()

    let fotoDePerfil : File | null = null;

    async function modificar() {
        

        let fd : FormData = new FormData();

        /*for (const [key, value] of Object.entries(data)) {
            fd.append(key, value);
        }*/
        if (data.fechaNacimiento === null) return;

        fd.append("nombre", data.nombre);
        fd.append("apellido", data.apellido);
        fd.append("dni", data.dni);
        fd.append("fechaNacimiento", (new Date(data.fechaNacimiento)).getTime().toString() ?? "");
        fd.append("cbu", (data.cbu && data.cbu !== "null") ? data.cbu : "");

        if (fotoDePerfil !== null) {
            fd.append("fotoDePerfil", fotoDePerfil, fotoDePerfil.name)
        }

        try {
            await UsuariosService.editarPerfil(fd);
            popupExitoVisible = true;
        } catch(e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true;
            }                    
        }
    }
</script>



<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <div class="flex flex-col gap-2 overflow-y-auto md:flex-row md:flex-wrap">
            <TextField label="Nombre" bind:value={data.nombre} classes="w-full md:w-fit md:grow" validate={validateNombre} max={50}/>
            <TextField label="Apellido" bind:value={data.apellido} classes="w-full md:w-fit md:grow" validate={validateApellido} max={50}/>
            <TextField label="DNI N.°" bind:value={data.dni} classes="w-full md:w-fit md:grow" validate={validateDNI} min={8} max={9}/>
        </div>
        <DatePicker label="Fecha de nacimiento" bind:value={data.fechaNacimiento} classes="w-full" validate={validateFechaNacimiento}/>
        <TextField label="CBU/CVU" bind:value={data.cbu} classes="w-full" validate={validateCBU} min={22} max={22}/>
        <FilePicker label="Cambiar foto de perfil" bind:file={fotoDePerfil} accept={[".jpeg",".jpg",".png"]} validate={validateFotoDePerfil} classes=""/>
        <Warning text={errorTamanoFotoDePerfil} visible={errorTamanoFotoDePerfilVisible}/>
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={() => {goto("/Perfil")}}>Cancelar</Button>
        <Button action={modificar} disabled={!completado}>Guardar</Button>
    </div>
    
</div>

<Popup title={"Éxito"} bind:visible={popupExitoVisible} fitH fitW>
    Perfil modificado exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto("/Perfil")}}>Aceptar</Button>
    </div>
</Popup>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para modificar su perfil.
</PopupError>
