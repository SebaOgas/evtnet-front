<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import PopupError from "$lib/components/PopupError.svelte";
    import { EspaciosService } from "$lib/services/EspaciosService";
    import type DTOResenasEspacio from "$lib/dtos/espacios/DTOResenasEspacio";
    import { get } from "svelte/store";
    import { page } from "$app/state";
	  import { formatDate } from "$lib/components/DatePicker.svelte";
	  import { token, permisos } from "$lib/stores";
	  import { HttpError } from "$lib/request/request";

    $: nombreEspacio = ""
    $: errorPermiso = false;
    $: errorGenerico = ""
    $: errorGenericoVisible = false

    $: id = Number(page.params.id);

    $: resenas = {} as DTOResenasEspacio;
    $: totalResenas = 0;

    let referencias = [
      { estrellas: 5, color: '#009ee3', texto: '5 estrellas' },
      { estrellas: 4, color: '#ff7f2a', texto: '4 estrellas' },
      { estrellas: 3, color: '#00b388', texto: '3 estrellas' },
      { estrellas: 2, color: '#7c2a8c', texto: '2 estrellas' },
      { estrellas: 1, color: '#6bbd2a', texto: '1 estrella' }
    ];
    
    let previousPage = "/";

    onMount(async () => {
      if (get(token) === "") {
              goto("/");
      }

      if(!get(permisos).includes("VisionEspacios")) {
          goto("/Espacios")
      }

      try {
          nombreEspacio = await EspaciosService.obtenerNombreEspacio(id);
          resenas = await EspaciosService.obtenerResenasEspacio(id);
          totalResenas = resenas.puntuaciones.reduce((acc, p) => acc + p.cantidad, 0);
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
    <h1 class="text-m text-center">{nombreEspacio}</h1>
    <h2 class="text-s text-center">Reseñas</h2>

    <!-- Barra de puntuaciones -->
    <div class="flex flex-col gap-2 w-full mb-2">
      {#each resenas.puntuaciones as p, i}
        <div class="flex items-center gap-2">
          <div class="h-4 rounded" style="background:{referencias[i].color}; width: {Math.round((p.cantidad/totalResenas)*100)}%"></div>
          <span class="text-xs">{Math.round((p.cantidad/totalResenas)*100)}%</span>
        </div>
      {/each}
    </div>

    <!-- Referencias -->
    <div class="flex flex-row flex-wrap gap-2 items-center my-2">
      {#each resenas.puntuaciones as r}
        <div class="flex items-center gap-1">
          <span style="color:{referencias.filter(ref => ref.estrellas === r.puntuacion)[0].color}">●</span> {r.cantidad} estrellas <span class="text-cyan-500">✔</span>
        </div>
      {/each}
    </div>

    <!-- Listado de reseñas -->
    {#each resenas.resenas as r}
      <div class="flex flex-col border-b pb-2 mb-2">
        <div class="flex items-center gap-2 justify-between">
          {#each Array(5) as _, i}
            <span class="text-xl" style="color: #ff7f2a">{i < r.puntuacion ? '★' : '☆'}</span>
          {/each}
          <span class="text-xs ml-2">{formatDate(r.fecha, true)}</span>
        </div>
        <div class="font-semibold">{r.titulo}</div>
        <div class="text-xs">Por {r.usuario}, <span class="text-cyan-500">@{r.username}</span></div>
        <div class="text-xs">{r.comentario}</div>
      </div>
    {/each}
  </div>

  <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
    <Button action={() => {goto(previousPage)}}>Atrás</Button>
    <Button action={() => {goto(`${page.url.pathname}/Nueva`)}}>Realizar reseña</Button>
  </div>
</div>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para acceder a este perfil de usuario.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<style>
.border-b { border-bottom: 1px solid #eee; }
.text-cyan-500 { color: #06b6d4; }
.rounded { border-radius: 4px; }
</style>
