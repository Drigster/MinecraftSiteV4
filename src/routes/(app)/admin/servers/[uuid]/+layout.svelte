<script lang="ts">
	import { page } from "$app/state";

	let { children } = $props();
</script>

<div class="container gap-4">
	<div class="contentBlock p-4">
		<ul class="flex gap-2 flex-col">
			<li class="border-2 rounded-lg px-2 border-primary">
				<a href="/admin/servers/{page.params.uuid}/">Overview</a>
			</li>
			<li class="border-2 rounded-lg px-2 border-primary">
				<a href="/admin/servers/{page.params.uuid}/console">Console</a>
			</li>
			<li class="border-2 rounded-lg px-2 border-primary">
				<a href="/admin/servers/{page.params.uuid}/mods">Mods</a>
			</li>
			<li class="border-2 rounded-lg px-2 border-primary">
				<a href="/admin/servers/{page.params.uuid}/files">Files</a>
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
