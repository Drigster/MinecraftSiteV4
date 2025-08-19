<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<svelte:head>
	<title>Подтверждение почты | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top min-w-96">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Подтверждение почты
	</h2>

	<div class="text-center">
		<p class="mb-8">{data.message}</p>
		<a href="/"
			><button class="!p-2 !text-base">Вернутся на главную</button></a
		>
	</div>
</div>
