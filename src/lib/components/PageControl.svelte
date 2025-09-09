<script lang="ts">
	import Button from "./Button.svelte";
	import TextField from "./TextField.svelte";

    export let page : number;
    export let lastPage : number;

    let tmpPage : string = "" + page;

    function onChange() {
        
        let aux = parseInt(tmpPage);
        if (Number.isNaN(aux)) aux = 0;

        if (!/^[0-9]+$/.test(tmpPage)) {
            tmpPage = "" + aux;
        }

        page = aux;
    }

    function addPage(n: number) {
        if (page+n < 0 || page+n > lastPage) return;
        page = page + n;
        tmpPage = "" + page;
    }

    function setPage(n: number) {
        if (n < 0) n = 0;
        if (n > lastPage) n = lastPage;
        page = n;
        tmpPage = "" + page;
    }


</script>


<div class="flex flex-row gap-2 justify-between items-center">
    <Button action={() => setPage(0)} disabled={page === 0}>&lt&lt</Button>
    <Button action={() => addPage(-1)} disabled={page === 0}>&lt</Button>
    <TextField 
        bind:value={tmpPage} 
        label="" 
        classes="w-[40pt] self-stretch !m-0 [&>*]:w-full [&>*]:h-full [&>*]:text-center" 
        max={4}
        change={onChange}
    />
    <Button action={() => addPage(1)} disabled={page === lastPage}>&gt</Button>
    <Button action={() => setPage(lastPage)} disabled={page === lastPage}>&gt&gt</Button>
</div>