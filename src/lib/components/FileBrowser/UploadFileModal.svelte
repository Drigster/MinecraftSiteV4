<script lang="ts">
	import type { UploadFileSchema } from "./schema";
	import { Label } from "../ui/label";
	import { Input } from "../ui/input";
	import { Button } from "../ui/button";
	import { page } from "$app/state";
	import { getFlash } from "sveltekit-flash-message";
	import * as Dialog from "$lib/components/ui/dialog/index.js";

	const flash = getFlash(page);

	let isOpen = $state(false);
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class="rounded-md border-2 border-gray-500 p-1"
		>Загрузить файл</Dialog.Trigger
	>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Загрузить файл</Dialog.Title>
		</Dialog.Header>
		<form
			class="flex flex-col"
			action="?/upload"
			method="post"
			enctype="multipart/form-data"
			use:enhance
		>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="file" class="text-right">Файл</Label>
					<Input
						id="file"
						type="file"
						name="file"
						class="col-span-3"
					/>
					{#if $errors.file}
						<span>{$errors.file}</span>
					{/if}
				</div>
			</div>
			<Dialog.Footer>
				<Button class="ml-auto" type="submit">Save changes</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
