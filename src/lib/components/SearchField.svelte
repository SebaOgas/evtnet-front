<script lang="ts">
	import Button from "./Button.svelte";
	import TextField from "./TextField.svelte";

    export let searchFunction : (val: string) => Promise<Map<number, string>>; //Call this function to get the results
    export let searchFilter : (val: string) => boolean = () => true; //Only call searchFunction if this returns true
    export let autoSearch : boolean = false; //Try to search whenever searchValue changes

    export let results : Map<number, string> = new Map<number, string>() //Map to bind with the results of the search

    $: searchValue = ""

    async function search() {
        if (searchFilter(searchValue))
            results = await searchFunction(searchValue);        
    }

    async function autoSearchFn() {
        if (autoSearch) 
            search();
    }
</script>



<div class="flex w-full gap-2">
    <TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={searchValue} action={search} change={autoSearchFn}></TextField>
    <Button icon="icons/search.svg" action={search}></Button>
</div>