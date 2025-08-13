<script>
	import "../app.css";
	import { getFlash } from "sveltekit-flash-message";
	import { page } from "$app/state";
	import { addToast } from "$lib/components/toast";
	import Toasts from "$lib/components/toast/Toasts.svelte";

	const flash = getFlash(page);

	let { children } = $props();

	flash.subscribe(($flash) => {
		if (!$flash) return;
		addToast({
			message: $flash.message,
			type: $flash.type,
			title: $flash.title,
		});

		// Clearing the flash message could sometimes
		// be needed here to avoid double-toasting.
		flash.set(undefined);
	});
</script>

{@render children()}
<Toasts placement="bottom-right" />
