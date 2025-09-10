<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import Button from "$lib/components/Button.svelte";
    import DatePicker from "$lib/components/DatePicker.svelte";
    import TextField from "$lib/components/TextField.svelte";
    import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
    import PopupError from "$lib/components/PopupError.svelte";
    import type DTOModificarUsuario from "$lib/dtos/usuarios/DTOModificarUsuario";
    import type DTOUsuarioCompleto from "$lib/dtos/usuarios/DTOUsuarioCompleto";
    import { HttpError } from "$lib/request/request";
    import { UsuariosService } from "$lib/services/UsuariosService";
    import { permisos, token } from "$lib/stores";
    import { get } from "svelte/store";
    import { onMount } from "svelte";
    import Warning from "$lib/components/Warning.svelte";
    import Popup from "$lib/components/Popup.svelte";

    $: errorPermiso = false;
    $: errorVisible = false;
    $: error = "";
    $: exitoVisible = false;
    $: loading = true;

    $: username = page.params.username;
    $: usuarioOriginal = null as DTOUsuarioCompleto | null;

    $: data = {
        username: "",
        usernameNuevo: "",
        nombre: "",
        apellido: "",
        dni: "",
        fechaNacimiento: new Date(),
        mail: "",
        roles: []
    } as DTOModificarUsuario;

    $: rolesSeleccionados = new Map<number, string>();
    $: popupRolesVisible = false;
    $: todosLosRoles = new Map<number, string>();

    onMount(async () => {
        if (get(token) === "") {
            goto("/");
            return;
        }

        if (!get(permisos).includes("AdministracionUsuarios")) {
            errorPermiso = true;
            return;
        }

        if (username === undefined) {
            error = "Nombre de usuario no especificado";
            errorVisible = true;
            return;
        }

        try {
            // Load user data
            usuarioOriginal = await UsuariosService.adminObtenerUsuarioCompleto(username);
            
            // Initialize form data
            data.username = usuarioOriginal.username;
            data.usernameNuevo = usuarioOriginal.username;
            data.nombre = usuarioOriginal.nombre;
            data.apellido = usuarioOriginal.apellido;
            data.dni = usuarioOriginal.dni;
            data.fechaNacimiento = new Date(usuarioOriginal.fechaNacimiento);
            data.mail = usuarioOriginal.mail;

            // Load all roles and set selected ones
            const rolesResponse = await UsuariosService.obtenerRoles();
            todosLosRoles = new Map();
            rolesResponse.forEach((rol) => {
                todosLosRoles.set(rol.id, rol.nombre);
            });

            // Set selected roles based on user's current roles
            rolesSeleccionados = new Map();
            rolesResponse.forEach((rol) => {
                if (usuarioOriginal?.roles.includes(rol.nombre)) {
                    rolesSeleccionados.set(rol.id, rol.nombre);
                }
            });

            loading = false;
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message;
                errorVisible = true;
            }
            loading = false;
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

    function validateApellido(apellido: string) {
        apellido = apellido.trim();
        if (apellido.length === 0) {
            return {
                valid: false,
                reason: "Es obligatorio ingresar el apellido"
            };
        }
        if (apellido.length > 50) {
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

    function validateUsername(username: string) {
        username = username.trim();
        if (username.length === 0) {
            return {
                valid: false,
                reason: "Es obligatorio ingresar el nombre de usuario"
            };
        }
        if (username.length > 50) {
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

    function validateDNI(dni: string) {
        dni = dni.trim();
        if (dni.length === 0) {
            return {
                valid: false,
                reason: "Es obligatorio ingresar el DNI"
            };
        }
        if (dni.length < 7 || dni.length > 8 || !/^[0-9]{7,8}$/.test(dni)) {
            return {
                valid: false,
                reason: "El DNI debe tener entre 7 y 8 números"
            };
        }
        return {
            valid: true,
            reason: undefined
        };
    }

    function validateMail(mail: string) {
        mail = mail.trim();
        if (mail.length === 0) {
            return {
                valid: false,
                reason: "Es obligatorio ingresar el correo electrónico"
            };
        }
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(mail)) {
            return {
                valid: false,
                reason: "Formato de correo electrónico inválido"
            };
        }
        return {
            valid: true,
            reason: undefined
        };
    }

    function validateFechaNacimiento(fecha: Date | null) {
        if (fecha === null) {
            return {
                valid: false,
                reason: "Es obligatorio ingresar la fecha de nacimiento"
            };
        }
        fecha = new Date(fecha);

        const today = new Date();
        let age = today.getFullYear() - fecha.getFullYear();
        const monthDiff = today.getMonth() - fecha.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < fecha.getDate())) {
            age--;
        }

        if (age < 18) {
            return {
                valid: false,
                reason: "Debe ser mayor de 18 años"
            };
        }

        if (age > 100) {
            return {
                valid: false,
                reason: "Debe ser menor de 100 años"
            };
        }

        return {
            valid: true,
            reason: undefined
        };
    }

    async function searchRoles(val: string) {
        try {
			const response = await UsuariosService.obtenerRoles();
            let ret: Map<number, string> = new Map();
            response.forEach((item) => {
                ret.set(item.id, item.nombre);
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
        validateNombre(data.nombre).valid &&
        validateApellido(data.apellido).valid &&
        validateUsername(data.usernameNuevo).valid &&
        validateDNI(data.dni).valid &&
        validateMail(data.mail).valid &&
        validateFechaNacimiento(data.fechaNacimiento).valid &&
        rolesSeleccionados.size > 0
    );

    async function guardar() {
        data.roles = Array.from(rolesSeleccionados.keys());
        
        try {
            await UsuariosService.modificarUsuario(data);
            exitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                if (e.message.includes("username") || e.message.includes("nombre de usuario")) {
                    error = "El nombre de usuario ingresado ya pertenece a otro usuario";
                } else if (e.message.includes("mail") || e.message.includes("correo")) {
                    error = "El correo electrónico ingresado ya está vinculado a otro usuario";
                } else if (e.message.includes("permiso") && e.message.includes("asignar")) {
                    const rolMatch = e.message.match(/'([^']+)'/);
                    const rolName = rolMatch ? rolMatch[1] : "rol";
                    error = `No tiene permiso para asignar el rol '${rolName}'`;
                } else if (e.message.includes("permiso") && e.message.includes("quitar")) {
                    const rolMatch = e.message.match(/'([^']+)'/);
                    const rolName = rolMatch ? rolMatch[1] : "rol";
                    error = `No tiene permiso para quitar el rol '${rolName}'`;
                } else {
                    error = e.message;
                }
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
        <h1 class="text-m text-center md:text-start">Edición de Usuario</h1>
        
        {#if !loading && usuarioOriginal}
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
                    label="Apellido" 
                    bind:value={data.apellido} 
                    classes="w-full"
                    validate={validateApellido}
                    forceValidate
                    max={50}
                />

                <TextField 
                    label="Username" 
                    bind:value={data.usernameNuevo} 
                    classes="w-full" 
                    validate={validateUsername}
                    forceValidate
                    max={50}
                />

                <TextField 
                    label="DNI" 
                    bind:value={data.dni} 
                    classes="w-full" 
                    validate={validateDNI}
                    forceValidate
                    min={7}
                    max={8}
                />

                <TextField 
                    label="Correo electrónico" 
                    bind:value={data.mail}
                    validate={validateMail}
                    forceValidate
                    classes="[&>span]:whitespace-nowrap"
                />

                <DatePicker 
                    label="Fecha de nacimiento" 
                    bind:value={data.fechaNacimiento}
                    validate={validateFechaNacimiento}
                    {minDate}
                    {maxDate}
                />

                <div class="flex flex-col gap-2">
                    <div class="flex gap-2 items-center">
                        Roles:
                        <Button 
                            classes="w-fit" 
                            action={() => {popupRolesVisible = true}}
                        >
                            Seleccionar
                        </Button>
                    </div>
                    <div class="commaList">
                        {#each rolesSeleccionados as [id, nombre]}
                            <span>
                                {nombre}
                            </span>
                        {/each}
                    </div>
                    <Warning visible={rolesSeleccionados.size === 0} text="Seleccione al menos un rol"></Warning>
                </div>
            </div>
        {/if}
    </div>
        
    <div class="flex gap-2 h-fit p-2 justify-center items-center md:justify-start">
        <Button classes="text-m" action={cancelar}>Cancelar</Button>
        <Button classes="text-m" action={guardar} disabled={!completado}>Guardar</Button>
    </div>
</div>

<PopupSeleccion 
    title="Selección de roles" 
    multiple={true} 
    bind:visible={popupRolesVisible} 
    searchFunction={searchRoles} 
    bind:selected={rolesSeleccionados}
    noSearch
/>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para editar usuarios.
</PopupError>

<Popup bind:visible={exitoVisible} fitH fitW>
    <span>
        Usuario modificado exitosamente
    </span>
    <div class="flex w-full justify-center">
        <Button action={() => goto("/AdministrarUsuarios")}>Aceptar</Button>
    </div>
</Popup>