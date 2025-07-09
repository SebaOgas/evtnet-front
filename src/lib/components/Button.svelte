<script lang="ts">
    export let icon : string | null | undefined = null

    export let classes : string = ""

    export let disabled : boolean = false

    export let action : () => void = () => {}

    export let toggable : boolean = false

    export let active : boolean = false

    let button: HTMLButtonElement;

    function click() {
        action();
        if (toggable) {
            active = !active;
            if (active) {
                button.classList.add("on");
            } else {
                button.classList.remove("on");
            }
        }
    }
</script>

<button {disabled} bind:this={button} on:click={click} class="{classes} bg-light text-white rounded-lg p-1 flex items-center justify-center gap-1 cursor-pointer w-fit disabled:cursor-not-allowed">
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
        color: var(--color-dark);
    }

    button:not(:disabled):hover, button:not(:disabled):focus {
        filter: brightness(1.1);
    }

    button:not(:disabled):active, button:not(:disabled).on {
        background-color: var(--color-dark);
        color: var(--color-white);
    }
</style>