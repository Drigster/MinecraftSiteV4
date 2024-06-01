<script lang="ts">
	import { page } from '$app/stores';
	import Footer from "$lib/Footer.svelte";
	import Navbar from "$lib/Navbar.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<Navbar {data} />
<main class="content-grid flex-grow">
	<div class="center authForm contentBlock full-top min-w-96">
		<h2 class="text-center mx-auto uppercase text-3xl mb-4 text-accent font-bold">
			{$page.status}
		</h2>
		<div class="text-center">
			<p class="mb-8">
				{$page.error?.message}
			</p>
		</div>
		<div class="flex justify-center px-4">
			<a href="/"><button class="!p-2 !text-base">На главную</button></a>
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
