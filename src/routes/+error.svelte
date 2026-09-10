<script lang="ts">
	import { page } from "$app/state";
	import Footer from "$lib/components/Footer.svelte";
	import Navbar from "$lib/components/Navbar.svelte";
	import Button from "$lib/components/Button.svelte";
	import { type PageData } from "./(app)/$types";

	export let data: PageData;
</script>

<svelte:head>
	<title>{page.error?.message || page.status || "Ошибка"} | Foxy.town</title>
</svelte:head>

<Navbar user={data.user} />
<main class="content-grid">
	<div class="bg-blur m-auto rounded-lg bg-background/60 p-8 text-center">
		<p class="text-xs font-black tracking-[0.2em] text-text-muted">ERROR</p>
		<h1 class="mt-4 text-7xl font-black uppercase text-accent">
			{page.status}
		</h1>
		<p class="mt-4 max-w-[32ch]">
			{#if page.status == 404}
				This page drifted off somewhere. The link may be old, or it may
				never have existed at all.
			{:else}
				{page.error?.message}
			{/if}
		</p>
		<div class="mt-6">
			<Button href="/">На главную</Button>
		</div>
	</div>
</main>
<Footer />

<style>
	.content-grid {
		min-height: 100vh;
		min-height: 100svh;
	}
</style>
