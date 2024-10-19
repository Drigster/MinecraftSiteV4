<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	import Navbar from "$lib/components/Navbar.svelte";
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<Navbar user={data.user} />
<main class="content-grid flex-grow">
	<slot />
</main>
<Footer />

<style>
	.content-grid {
		min-height: 100vh;
		min-height: 100svh;
	}
</style>
