<script lang="ts">
	import EditableLabel from "$lib/components/EditableLabel.svelte";
	import { changeUsername } from "../../../(authorized)/profile/[[id]]/profile.remote";

	let { data } = $props();
</script>

<h2 class="text-2xl">Сервера</h2>
<div class="profileInfo p-4">
	<EditableLabel
		title="Название"
		change={changeUsername}
		value={data.server.name}
		input="name"
	/>
	<EditableLabel
		title="Код"
		change={changeUsername}
		value={data.server.codename}
		input="codename"
	/>
	<EditableLabel
		title="UUID"
		change={changeUsername}
		value={data.server.uuid}
		input="codename"
	/>
	<EditableLabel
		title="Статус"
		change={changeUsername}
		value={data.server.status}
		input="codename"
	/>
	<EditableLabel
		title="IP"
		change={changeUsername}
		value={`${data.server.ip}:${data.server.port}`}
		input="codename"
	/>
	<EditableLabel
		title="Локальный IP"
		change={changeUsername}
		value={`${data.server.localIp}:${data.server.localPort}`}
		input="codename"
	/>
	<EditableLabel
		title="Владелец"
		change={changeUsername}
		value={`${data.server.owner?.username || data.server.ownerId}`}
		input="codename"
	/>
</div>

<style>
	.profileInfo {
		display: grid;
		grid-template-columns: 1fr minmax(30%, max-content);
	}
</style>
