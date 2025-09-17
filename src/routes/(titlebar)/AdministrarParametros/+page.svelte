<script lang="ts">
	import PopupError from "$lib/components/PopupError.svelte";
    import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
    import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;

    const parametros = [
        { nombre: "Disciplinas", ruta: "/AdministrarDisciplinas" },
        { nombre: "Icono característica", ruta: "/AdministrarIconoCaracteristica" },
        { nombre: "Modo de Evento", ruta: "/AdministrarModosEvento" },
        { nombre: "Comision por Inscripcion", ruta: "/AdministrarComisionInscripcion" },
        { nombre: "Comision por Organizacion", ruta: "/AdministrarComisionOrganizacion" },
        { nombre: "Parametrización", ruta: "/AdministrarParametrizacion" },
        { nombre: "Tipo Calificación", ruta: "/AdministrarTipoCalificacion" },
        { nombre: "Motivo de Calificación", ruta: "/AdministrarMotivoCalificacion" },
        { nombre: "Estado Denuncia Evento", ruta: "/AdministrarEstadoDenunciaEvento" },
        { nombre: "Estado Solicitud Espacio Publico", ruta: "/AdministrarEstadoSolicitudEspacioPublico" },
        { nombre: "Medio de Pago", ruta: "/AdministrarMedioPago" },
        { nombre: "Administrar Roles", ruta: "/AdministrarRoles" },
        { nombre: "Imágenes de Mascota", ruta: "/AdministrarImagenesMascota" },
        { nombre: "Instancias de Mascota", ruta: "/AdministrarInstanciasMascota" }
    ];

    onMount(() => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionParametros")) {
			errorPermiso = true;
			return;
		}
    });


</script>



<div id="content">
    <h1 class="text-m mt-4 mb-4 ml-4">Parámetros</h1>
    <div class="flex flex-col gap-3 ml-8">
        {#each parametros as p}
            <div class="flex items-center gap-2">
                <span>{p.nombre}</span>
                <Button classes="!px-3 !py-1 !text-xs" action={() => goto(p.ruta)}>Ver</Button>
            </div>
        {/each}
    </div>
</div>


<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para visualizar parámetros.
</PopupError>
