<script lang="ts">
	import FileBrowser from "$lib/components/FileBrowser/FileBrowser.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Профиль | Foxy.town</title>
</svelte:head>

<div>
	<a href="/admin/servers"><button>Назад</button></a>
	<FileBrowser {data} />
</div>
