<script lang="ts">
	import SideNav from "$lib/components/SideNav.svelte";

	let { children } = $props();
</script>

{@render children()}
