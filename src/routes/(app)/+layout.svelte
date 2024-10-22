<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	import Navbar from "$lib/components/Navbar.svelte";
	import type { Snippet } from "svelte";
	import type { PageData } from "./$types";

	let { data, children }: { data: PageData; children: Snippet } = $props();
</script>

<Navbar user={data.user} />
<main class="content-grid flex-grow">
	{@render children()}
</main>
<Footer />

<style>
	.content-grid {
		min-height: 100vh;
		min-height: 100svh;
	}
</style>
