<script lang="ts">
    export let checked : boolean = false;
    
    export let disabled : boolean = false
</script>



<label class="flex {disabled ? "disabled" : ""} items-center gap-2">
    <div class="box border rounded-sm flex items-center justify-center">
        {#if checked}
            <img src="icons/check.png" alt="✔" class="object-contain"/>
        {/if}
    </div>
	<input type="checkbox" {disabled} bind:checked={checked} class="hidden" />
	<slot/>
</label>

<style>
    .box {
        height: 30px;
        width: 30px;
        position: relative;
        overflow: hidden;
    }
    .box img {
        height: 23px;
        width: 23px;
        filter: drop-shadow(-100vw 0 0 var(--color-light));
        transform: translateX(100vw);
        user-select: none;
    }

    .disabled {
        border-color: var(--color-dark);
        color: var(--color-dark);
        cursor: not-allowed;
    }
</style>