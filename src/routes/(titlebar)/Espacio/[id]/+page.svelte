<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
    import { page } from "$app/state"
	import { HttpError } from "$lib/request/request";
	import type DTOEspacio from "$lib/dtos/espacios/DTOEspacio";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { IconosCaracteristicasService } from "$lib/services/IconosCaracteristicasService";
	import MapDisplay from "$lib/components/MapDisplay.svelte";

    import { goto, afterNavigate } from '$app/navigation';
    import { base } from '$app/paths'
	import { ImagenesEspaciosService } from "$lib/services/ImagenesEspaciosService";
	import Carousel from "$lib/components/Carousel.svelte";
	import type { DTOSubespacioDetalle } from "$lib/dtos/espacios/DTOEspacio";
	import type { DTOEspacioEstado } from "$lib/dtos/espacios/DTOEspacioEditar";

    let previousPage : string = base ;

    afterNavigate(({from}) => {
        previousPage = from?.url.pathname || previousPage
    }) 

    $: errorPermiso = false;

    $: id = Number(page.params.id);

    $: listo = false;

    $: data = {
		nombre: "",
        tipoEspacio: "",
		descripcion: "",
		direccion: "",
		latitud: 0,
		longitud: 0,
		cantidadImagenes: 0,
		disciplinas: [],
		caracteristicas: [],
		esAdmin: false,
        idChat: null,
        subEspacios: [] as DTOSubespacioDetalle[],
        estado:{} as DTOEspacioEstado,
    } as DTOEspacio;

    $: errorGenerico = ""
    $: errorGenericoVisible = false

    $: caracteristicas = [] as {nombre: string, imgUrl: string}[]

    $: imagenes = [] as {id: number, src: string}[]

    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("VisionEspacios")) {
            errorPermiso = true;
            return;
        }


        try {
            data = await EspaciosService.obtenerEspacio(id);
            
            for (let i = 0; i < data.cantidadImagenes; i++) {

                let img = await ImagenesEspaciosService.obtener(id, i+1);
                
                imagenes.push({
                    id: img.id,
                    src: img.url
                });
            }
            
            imagenes = [...imagenes]

            
            listo = true;
            
            /* data.caracteristicas?.forEach(async car => {
                let img = await IconosCaracteristicasService.obtener(car.imagenId);
                
                caracteristicas.push({
					nombre: car.nombre,
					imgUrl: img
				})
                caracteristicas = [...caracteristicas]
            }); */

        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }            
        }
    });
</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-s text-center">
            Espacio
        </h1>
        <h1 class="text-m text-center">
            {data.nombre}
        </h1>
        

		{#if data.esAdmin}
			<span>Estado del espacio</span>
			{data.estado!.nombre}
            {data.estado!.descripcion}
		{/if}		
        <h1 class="text-s text-center">
            {data.tipoEspacio}
        </h1>
        <p class="text-xs">
            {data.descripcion}
        </p>
        
        <!--Carrusel-->

        {#if listo}
            <Carousel slides={imagenes}/>
        {/if}

        <div>
            <span class="text-s">Dirección:</span>
            <span class="text-xs">{data.direccion}</span>
        </div>

        {#if listo}
        <div class="mb-2 mt-2">
            <span class="text-s">Ubicación:</span>
            <MapDisplay latitude={data.latitud} longitude={data.longitud} marked={{x: data.latitud, y: data.longitud}} zoom={14} disableMarking/>
        </div>
        {/if}

        <div class="mb-2 mt-2">
            <span class="text-s">Disciplinas:</span>
            <div class="commaList">
                {#each data.disciplinas as d}
                    <span>{d}</span>
                {/each}
            </div>
        </div>

        {#if caracteristicas !== null && caracteristicas.length === caracteristicas.length}
            <div class="mb-2 mt-2 w-full md:w-[50vw]">
                <div class="w-full mx-auto mb-4 text-s">
                    Características:
                </div>
                <ul class="w-full flex flex-col gap-2 justify-center">
                    {#each caracteristicas as car}
                        <div class="w-full h-fit flex flex-row justify-start items-center">
                            <img src={car.imgUrl} alt="Ícono" class="h-[40px] object-contain mr-2">
                            <span>{car.nombre}</span>
                        </div>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>


    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        <Button action={() => {goto(`/Espacios`)}}>Atrás</Button>
        {#if data.estado!.id==2 || data.estado!.id==3}
            <Button action={() => {goto(`/CrearEvento/${id}`)}}>Organizar evento</Button>
            <Button action={() => {goto(`${page.url.pathname}/Resenas`)}}>Ver reseñas</Button>
            <Button icon="/icons/share.svg"></Button>   
            
            {#if data.esAdmin }
                <Button icon="/icons/chat.svg" action={() => {goto(`/Chat/${data.idChat}`)}}></Button>           
                <Button action={() => {goto(`${page.url.pathname}/Administrar`)}}>Administrar</Button>
            {/if}
        {/if}
    </div>
</div>  

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para acceder a este perfil de usuario.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>
