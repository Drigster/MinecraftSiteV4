<script lang="ts">
	import { LoaderCircle } from "@o7/icon/lucide";
	import type { Snippet } from "svelte";

	let {
		children,
		disabled,
		loading,
		class: customClasses,
	}: {
		children?: Snippet | undefined;
		disabled?: boolean;
		loading?: boolean;
		class?: string;
	} = $props();
</script>

<button
	type="submit"
	class="flex items-center justify-center rounded-[0.25rem] bg-accent p-2 text-xl text-black hover:bg-accent/60 disabled:bg-accent/60 {customClasses}"
	{disabled}
>
	{@render children?.()}
	{#if loading}
		<LoaderCircle class="mx-1 animate-spin" size="20" />
	{/if}
</button>
