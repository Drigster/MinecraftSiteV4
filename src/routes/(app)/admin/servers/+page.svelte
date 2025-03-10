<script lang="ts">
	import type { PageData } from "./$types";
	import DataTable from "./data-table.svelte";

	let { data }: { data: PageData } = $props();
</script>

<div class="contentBlock p-4">
	<h2 class="text-2xl">Сервера</h2>
	<DataTable {data} />
</div>
