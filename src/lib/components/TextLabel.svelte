<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		title,
		titleClass = "",
		valueClass = "",
		children,
	}: {
		title: string;
		titleClass?: string;
		valueClass?: string;
		children: Snippet;
	} = $props();
</script>

<div class="col-span-2 grid grid-cols-subgrid content-center">
	<span class="py-[2px] {titleClass}">{title}</span>
	<span class="flex gap-1 {valueClass}">
		{@render children()}
	</span>
</div>
