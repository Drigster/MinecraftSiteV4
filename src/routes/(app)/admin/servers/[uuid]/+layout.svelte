<script lang="ts">
	import { page } from "$app/state";

	let { children } = $props();
</script>

<div class="container gap-4">
	<div class="contentBlock p-4">
		<ul class="flex flex-col gap-2">
			<li class="border-primary rounded-lg border-2 px-2">
				<a href="/admin/servers/{page.params.uuid}/">Overview</a>
			</li>
			<li class="border-primary rounded-lg border-2 px-2">
				<a href="/admin/servers/{page.params.uuid}/console">Console</a>
			</li>
			<li class="border-primary rounded-lg border-2 px-2">
				<a href="/admin/servers/{page.params.uuid}/mods">Mods</a>
			</li>
			<li class="border-primary rounded-lg border-2 px-2">
				<a href="/admin/servers/{page.params.uuid}/files">Files</a>
			</li>
		</ul>
	</div>
	<div class="contentBlock grid h-full grid-rows-[auto_1fr] p-4">
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
