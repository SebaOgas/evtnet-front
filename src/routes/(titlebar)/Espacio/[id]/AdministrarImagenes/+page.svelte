<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import Popup from "$lib/components/Popup.svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { EspaciosService } from "$lib/services/EspaciosService";
	import { get } from "svelte/store";
	import { permisos, token } from "$lib/stores";
	import { page } from "$app/state";
	import { HttpError } from "$lib/request/request";
    import type DTOEspacio from "$lib/dtos/espacios/DTOEspacio";
	import PopupError from "$lib/components/PopupError.svelte";
    import { base } from "$app/paths";
	import FilePicker, { getImageFileDimensions }  from "$lib/components/FilePicker.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import { ImagenesEspaciosService } from "$lib/services/ImagenesEspaciosService";

    let previousPage: string = base;
    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    $: id = Number(page.params.id);
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
        idChat: null
    } as DTOEspacio;

    $: imagenes = [] as {id: number, src: string, orden: number, archivo: File|null}[]
    let imagenNueva: {id: number, src: string, orden: number} | null = null;
    $: indiceAEliminar = 0;
    $: cambiosPendientes = false;

    $: popupConfirmEliminarVisible=false;

    $: popupExitoVisible = false;

    let fotoEspacio : File | null = null;

    $: errorTamanoFotoEspacioVisible = false
    $: errorTamanoFotoEspacio = ""

    onMount(async () => {
            if (get(token) === "") {
                goto("/");
            }

            const userPermisos = get(permisos);
            if (!userPermisos.includes("AdministracionEspaciosPrivados")) {
                errorPermiso = true;
                return;
            }

            try {
            data = await EspaciosService.obtenerEspacio(id);
            
            for (let i = 0; i < data.cantidadImagenes; i++) {

                let img = await ImagenesEspaciosService.obtener(id, i+1);
                
                imagenes.push({
                    id: img.id,
                    src: img.url,
                    orden: i+1,
                    archivo: null
                });
            }
            
            imagenes = [...imagenes]

            } catch (e) {
                if (e instanceof HttpError) {
                    errorGenerico = e.message;
                    errorGenericoVisible = true;
                }            
            }
        });

    function validateFotoEspacio(file: File | null, preventRequest = false) {
        if (!preventRequest) {
            
            (async () => {
                if (file === null) {
                    errorTamanoFotoEspacioVisible = false;
                    errorTamanoFotoEspacio = "";
                    return
                }

                let dims = await getImageFileDimensions(file);               

                if (dims.h !== dims.w) {
                    errorTamanoFotoEspacioVisible = true;
                    errorTamanoFotoEspacio = "La foto del espacio debe ser cuadrada"
                    return
                }

                if (dims.h < 500) {
                    errorTamanoFotoEspacioVisible = true;
                    errorTamanoFotoEspacio = "La foto del espacio debe ser más grande (mayor a 500px de ancho y alto)"
                    return
                }
                errorTamanoFotoEspacioVisible = false;
                errorTamanoFotoEspacio = "";
        
            })();
        }

        if (file === null) {
            return {
                valid: true,
                reason: undefined
            }
        }
        guardarNuevaImagen();
        return {
            valid: true,
            reason: undefined
        }
    }

    function moverArriba(idx: number) {
        if (idx > 0) {
            [imagenes[idx - 1], imagenes[idx]] = [imagenes[idx], imagenes[idx - 1]];
            [imagenes[idx - 1].orden, imagenes[idx].orden] = [idx, idx + 1];
            cambiosPendientes = true;
        }
    }

    function moverAbajo(idx:number) {
        if (idx < imagenes.length - 1) {
            [imagenes[idx + 1], imagenes[idx]] = [imagenes[idx], imagenes[idx + 1]];
            [imagenes[idx + 1].orden, imagenes[idx].orden] = [idx + 2, idx + 1];
            cambiosPendientes = true;
        }
    }

    async function eliminarImagen() {
        popupConfirmEliminarVisible = false;
        imagenes.splice(indiceAEliminar, 1);
        imagenes.forEach((img, i) => {
            img.orden = i + 1;
        });
        imagenes = [...imagenes]; 
        cambiosPendientes = true;
    }

    function agregarNuevaImagen() {
        imagenNueva = {id:0, src:"", orden: imagenes.length + 1};
        cambiosPendientes = true;
    }

    function guardarNuevaImagen() {
    if (fotoEspacio) {
        imagenes.push({
            id: 0,
            src: URL.createObjectURL(fotoEspacio),
            orden: imagenes.length + 1,
            archivo: fotoEspacio
        });
        imagenes = [...imagenes]; 
        fotoEspacio = null;
        imagenNueva = null;
        cambiosPendientes = true;
    }
}

    async function guardar() {
        const imagenesDTO = [
            ...imagenes.map(img => ({
                id: img.id,
                orden: img.orden,
                archivo: img.archivo
            }))
        ];

        const payload = {
            idEspacio: id,
            imagenes: imagenesDTO
        };

        try {
            await ImagenesEspaciosService.actualizar(payload);
            cambiosPendientes = false;
            imagenNueva = null;
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }  
        }
    }
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">Administrar imágenes del Espacio {data.nombre}</h1>
        <div class="flex flex-col items-center justify-center w-full gap-4">
            {#each [...imagenes] as img, index}
            <div class="flex flex-row items-center justify-center w-full max-w-md mx-auto gap-4">
                <div class="flex justify-center">
                    <img 
                        src={img.src} 
                        alt="Imagen {index + 1}"
                        class="max-w-[200px] max-h-[200px] md:max-w-[300px] md:max-h-[300px] object-contain select-none border rounded"
                        loading="lazy"
                        draggable="false"
                    />
                </div>
                <div class="flex flex-col gap-2 items-center min-w-[48px]">
                    <Button icon="/icons/arrow-up.svg" action={() => moverArriba(index)} classes="w-8 h-8 md:w-10 md:h-10" />
                    <Button icon="/icons/arrow-down.svg" action={() => moverAbajo(index)} classes="w-8 h-8 md:w-10 md:h-10" />
                    <Button icon="/icons/cross.svg" action={() => {popupConfirmEliminarVisible=true; indiceAEliminar=index;}} classes="w-8 h-8 md:w-10 md:h-10 mt-4" />
                </div>
            </div>
            {/each}

            {#if imagenNueva}
            <div class="flex flex-row items-center justify-center w-full max-w-md mx-auto gap-4 mt-4">
                <div class="flex flex-col justify-center items-center border rounded bg-white w-[200px] h-[200px] md:w-[300px] md:h-[300px]">
                    <FilePicker
                        label=""
                        bind:file={fotoEspacio}
                        accept={[".jpeg", ".jpg", ".png"]}
                        validate={validateFotoEspacio}
                        classes="flex justify-center"
                        buttonText="Seleccionar imagen"
                        showFileName={false}
                    />
                    <Warning text={errorTamanoFotoEspacio} visible={errorTamanoFotoEspacioVisible}/>
                </div>
                <div class="flex flex-col gap-2 items-center min-w-[48px]">
                    <Button icon="/icons/arrow-up.svg" disabled classes="w-8 h-8 md:w-10 md:h-10" />
                    <Button icon="/icons/arrow-down.svg" disabled classes="w-8 h-8 md:w-10 md:h-10" />
                    <Button icon="/icons/cross.svg" action={() => imagenNueva = null} classes="w-8 h-8 md:w-10 md:h-10 mt-4" />
                </div>
            </div>
            {/if}
        </div>
	</div>
    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
            <Button action={()=>{goto(previousPage)}}>Atrás</Button>
            <Button action={guardar} disabled={!cambiosPendientes}>Guardar</Button>
            <Button action={agregarNuevaImagen}>Nueva</Button>
    </div>
</div>



<Popup bind:visible={popupConfirmEliminarVisible} fitH fitW>
	¿Está seguro que desea eliminar la imagen?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupConfirmEliminarVisible = false}}>Cancelar</Button>
		<Button action={eliminarImagen}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para ver imágenes del espacio.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Imágenes guardadas exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/Espacio/${id}`)}}>Aceptar</Button>
    </div>
</Popup>