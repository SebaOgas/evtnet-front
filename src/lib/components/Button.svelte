<script lang="ts">
    export let icon : string | null | undefined = null

    export let classes : string = ""

    export let disabled : boolean = false

    export let action : () => void = () => {}
</script>

<button {disabled} on:click={action} class="{classes} bg-light text-white rounded-lg p-1 flex items-center justify-center gap-1 cursor-pointer w-fit disabled:cursor-not-allowed">
    {#if icon !== null && icon !== undefined}
        <img src={icon} alt="Ícono" class="object-contain">
    {/if}
    <slot/>
</button>

<style>
    img {
        height: 18pt;
        filter: brightness(0) invert(1);
    }

    button {
        user-select: none;
    }

    button:disabled {
        background-color: var(--color-dark);
    }

    button:not(:disabled):hover, button:not(:disabled):focus {
        filter: brightness(1.1);
    }

    button:not(:disabled):active {
        filter: brightness(0.9);
    }
</style>