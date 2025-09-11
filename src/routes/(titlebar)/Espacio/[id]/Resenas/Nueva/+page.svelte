<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
	import TextField from "$lib/components/TextField.svelte";
	import type DTOCrearResenaEspacio from "$lib/dtos/espacios/DTOCrearResenaEspacio";
	import Warning from "$lib/components/Warning.svelte";
	import { HttpError } from "$lib/request/request";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import PopupError from "$lib/components/PopupError.svelte";

    $: id = Number(page.params.id);
    $: nombreEspacio = ""

    $: warningPuntuacionVisible = false;
    $: warningTituloVisible = false;
    $: warningComentarioVisible = false;

    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;

    let data : DTOCrearResenaEspacio = {
            idEspacio: id,
            puntuacion: 0,
            titulo: "",
            comentario: ""
    }

    function validateTitulo(val: string) {
        if (val.trim() === "") {
            return {
                valid: false,
                reason: "Ingrese el título de la reseña"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }

    function validateComentario(val: string) {
        if (val.trim() === "") {
            return {
                valid: false,
                reason: "Ingrese el comentario a mostrar con la reseña"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }
    function seleccionarEstrellas(n: number) {
        if (data.puntuacion === n) {
            // Si hace clic en la misma estrella, desmarca todas
            data.puntuacion = 0;
        } else {
            // Si hace clic en otra, selecciona esa cantidad
            data.puntuacion = n;
        }
    }

    function cancelar() {
        goto(page.url.pathname);
    }

    async function publicarResena() {
        if (data.titulo === "") {
            warningTituloVisible = true;
        } else {
            warningTituloVisible = false;
        }

        if (data.comentario === "") {
            warningComentarioVisible = true;
        } else {
            warningComentarioVisible = false;
        }

        if (data.puntuacion === undefined || data.puntuacion === 0) {
            warningPuntuacionVisible = true;
        } else {
            warningPuntuacionVisible = false;
        }

        if (
            data.puntuacion === 0
            || data.titulo === ""
            || data.comentario === ""
        ) {return}

        try {
            data.idEspacio = id;
            await EspaciosService.crearResenaEspacio(data);
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
    <h1 class="text-m text-center">{nombreEspacio}</h1>
    <h2 class="text-s text-center">Realizar reseña</h2>

    <div class="flex flex-col gap-2 mb-2">
      <span class="font-semibold">Calificación:</span>
      <div class="flex flex-row gap-1">
        {#each Array(5) as _, i}
          <span class="text-2xl cursor-pointer" style="color: {i < data.puntuacion ? '#ff7f2a' : '#ccc'}" on:click={() => seleccionarEstrellas(i+1)}>
            {i < data.puntuacion ? '★' : '☆'}
          </span>
        {/each}
      </div>
      <div class="flex flex-row gap-1"><Warning text="Ingrese la calificación presionando sobre alguna estrella" visible={warningPuntuacionVisible}/></div>
    </div>

    <div class="flex flex-col gap-1 mb-2">
        <TextField label="Título" bind:value={data.titulo} validate={validateTitulo} forceValidate={warningTituloVisible}/>
    </div>

    <div class="flex flex-col gap-1 mb-2">
        <TextField label="Comentario" multiline bind:value={data.comentario} rows={6} validate={validateComentario} forceValidate={warningComentarioVisible}/>
    </div>
  </div>

  <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
    <Button action={cancelar}>Cancelar</Button>
    <Button action={publicarResena}>Publicar</Button>
  </div>
</div>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para acceder a este perfil de usuario.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<style>
.text-2xl { font-size: 4rem; }
.cursor-pointer { cursor: pointer; }
</style>
