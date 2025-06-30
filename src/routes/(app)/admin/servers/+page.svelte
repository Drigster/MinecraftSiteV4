<script lang="ts">
	import type { PageData } from "./$types";
	import DataTable from "./data-table.svelte";

	let { data }: { data: PageData } = $props();
</script>

<div class="contentBlock p-4">
	<h2 class="text-2xl">Сервера</h2>
	<table>
		<thead> </thead>
		<tbody>
			{#each data.servers as server}
				<tr>
					<td
						><a href="/admin/server/{server.uuid}">{server.name}</a
						></td
					>
					<td>{server.owner}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<!-- <DataTable {data} /> -->
</div>
