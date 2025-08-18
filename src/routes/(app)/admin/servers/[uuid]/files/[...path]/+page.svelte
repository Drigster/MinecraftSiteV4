<script lang="ts">
	import FileBrowser from "$lib/components/FileBrowser/FileBrowser.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Профиль | Foxy.town</title>
</svelte:head>

<div>
	<a href="/admin/serverss"><button>Назад</button></a>
	<FileBrowser files={data.files} />
</div>
