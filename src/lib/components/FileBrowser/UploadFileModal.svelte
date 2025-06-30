<script lang="ts">
	import type { SuperValidated, Infer } from "sveltekit-superforms";
	import { superForm } from "sveltekit-superforms";
	import type { UploadFileSchema } from "./schema";
	import { Label } from "../ui/label";
	import { Input } from "../ui/input";
	import { Button } from "../ui/button";
	import { page } from "$app/stores";
	import { getFlash } from "sveltekit-flash-message";
	import * as Dialog from "$lib/components/ui/dialog/index.js";

	let { data }: { data: SuperValidated<Infer<UploadFileSchema>> } = $props();
	const flash = getFlash(page);

	const { form, errors, enhance, reset } = superForm(data, {
		resetForm: true,
		onUpdated({ form }) {
			if (form.message) {
				isOpen = false;
				$flash = {
					type: form.message.type,
					message: form.message.text,
					title: form.message.title,
				};
			}
		},
	});

	let isOpen = $state(false);

	$effect(() => {
		if (!isOpen) {
			reset();
		}
	});
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger class="p-1 border-2 border-gray-500 rounded-md"
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
