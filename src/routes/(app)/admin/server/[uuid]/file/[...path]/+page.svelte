<script lang="ts">
	import { page } from "$app/state";
	import type { PageData } from "./$types";
	import { onMount } from "svelte";
	import hljs from "highlight.js";
	import "highlight.js/styles/atom-one-dark.css";
	import { Download } from "@o7/icon/lucide";

	let { data }: { data: PageData } = $props();

	let codeBlock = $state<HTMLElement>();

	onMount(() => {
		$effect(() => {
			if (codeBlock) {
				hljs.highlightElement(codeBlock);
			}
		});
	});
</script>

<svelte:head>
	<title>Профиль | Foxy.town</title>
</svelte:head>

<div class="py-2 flex flex-col gap-1">
	<div class="flex gap-1 justify-between">
		<a
			href={`${$page.url.searchParams.get("from") || "/server/" + $page.params.uuid + "/files/"}`}
			><button>Назад</button></a
		>
	</div>
	<div
		class="bg-background h-full text-sm border-2 border-gray-500 rounded-md flex flex-col"
	>
		<div class="p-1 border-b-2 border-gray-500">
			<div class="flex gap-1 justify-between">
				{data.filename}
				<a
					href="/server/{$page.params
						.uuid}/download/?filePath={$page.url.searchParams.get(
						'filePath',
					)}"
					><button class="flex items-center"
						><Download size="20" />Скачать</button
					></a
				>
			</div>
		</div>
		{#await data.buffer}
			<p class="p-2 text-xl text-center">Loading...</p>
		{:then raw}
			<pre class="overflow-auto max-h-full m-0 text-xs"><code
					class="log4j grid-area-1-1 max-w-full block overflow-x-auto p-2"
					bind:this={codeBlock}>{new TextDecoder().decode(raw)}</code
				></pre>
			<!-- <pre class="overflow-auto h-full"><code
					class="overflow-x-auto h-full"
					bind:this={codeBlock}>{new TextDecoder().decode(raw)}</code
				></pre> -->
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	</div>
</div>

<style>
	pre code {
		background-color: transparent !important;
		padding: 0.5rem !important;
	}
</style>
