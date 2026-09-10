<script lang="ts">
	import { resolve } from "$app/paths";
	import type { Pathname } from "$app/types";
	import type { Snippet } from "svelte";

	let {
		children,
		href,
		class: customClass,
		type,
		onclick,
	}: {
		children?: Snippet;
		href?: Pathname;
		class?: string;
		type?: "submit";
		onclick?: () => void;
	} = $props();
</script>

{#snippet button()}
	<button
		class="inline-block rounded-md bg-accent px-[1em] pb-[0.5em] pt-[0.5em] align-middle leading-4 text-black transition-colors hover:bg-accent/60 disabled:cursor-default disabled:bg-accent/60 {customClass}"
		{onclick}
		{type}
	>
		{@render children?.()}
	</button>
{/snippet}

{#if href != undefined}
	<a class="w-fit" href={resolve(href)}>{@render button()}</a>
{:else}
	{@render button()}
{/if}
