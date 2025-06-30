<script lang="ts">
	import { page } from "$app/state";

	let { children } = $props();
</script>

<div class="container gap-4">
	<div class="contentBlock p-4">
		<ul class="flex gap-2 flex-col">
			<li class="border-2 rounded-lg px-2 border-primary">
				<a href="/admin/server/{page.params.id}/">Overview</a>
			</li>
			<li class="border-2 rounded-lg px-2 border-primary">
				<a href="/admin/server/{page.params.id}/console">Console</a>
			</li>
			<li class="border-2 rounded-lg px-2 border-primary">
				<a href="/admin/server/{page.params.id}/mods">Mods</a>
			</li>
			<li class="border-2 rounded-lg px-2 border-primary">
				<a href="/admin/server/{page.params.id}/files">Files</a>
			</li>
		</ul>
	</div>
	<div class="contentBlock p-4 grid grid-rows-[auto_1fr] h-full">
		{@render children()}
	</div>
</div>

<style>
	.container {
		display: grid;
		width: 100%;
		height: 100%;
		grid-template-columns: max-content 1fr;
	}
</style>
