<script lang="ts">
	import Button from "$lib/components/Button.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>Подтверждение почты | Foxy.town</title>
</svelte:head>

<div class="bg-blur m-auto min-w-96 rounded-lg bg-background/60 p-10">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Подтверждение почты
	</h2>

	<div class="text-center">
		<p class="mb-8">{data.message}</p>
		<Button href="/">Вернутся на главную</Button>
	</div>
</div>
