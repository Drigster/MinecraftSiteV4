<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { EllipsisVertical } from "@o7/icon/heroicons";

	export let server_uuid: string;
	export let owner_uuid: string;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger><EllipsisVertical /></DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Server actions</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item href="/server/{server_uuid}"
				>Edit server</DropdownMenu.Item
			>
			<DropdownMenu.Item href="/server/{server_uuid}/files"
				>Server files</DropdownMenu.Item
			>
			<DropdownMenu.Item href="/profile/{owner_uuid}"
				>Owner profile</DropdownMenu.Item
			>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
