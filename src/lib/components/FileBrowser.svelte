<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import type { FileType } from "$lib/apiTypes";
	import { formatBytes } from "$lib/utils";
	import {
		File,
		FileArchive,
		FileImage,
		FileWarning,
		FolderOpen,
		FileText,
		FileJson,
		FileSliders,
		FileCog,
		House,
	} from "@o7/icon/lucide";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";

	let {
		files,
	}: {
		files: FileType[];
	} = $props();
	let path = $derived("/" + $page.params.path || "/");
	let viewType = $state<"dir" | "file">("dir");

	let currentPathFiles = $derived(files.filter((file) => file.path == path));
</script>

<div>
	{#if viewType == "dir"}
		<div class="flex justify-between pb-1">
			<div class="p-2 flex">
				<a
					href={"/server/" + $page.params.uuid + "/files/"}
					class=" text-blue-400"
				>
					<House />
				</a>
				{#each path.split("/") as part, i}
					{#if i != path.split("/").length - 1}
						<a
							href={"/server/" +
								$page.params.uuid +
								"/files" +
								path.substring(
									0,
									path.lastIndexOf(part) + part.length,
								)}
							class=" text-blue-400"
						>
							{part}
						</a>
					{:else}
						{part}
					{/if}
					{#if path != "/" || i > 0}
						<span class="mx-1 text-gray-500">/</span>
					{/if}
				{/each}
			</div>
			<Dialog.Root>
				<Dialog.Trigger class="p-1 border-2 border-gray-500 rounded-md"
					>Загрузить файл</Dialog.Trigger
				>
				<Dialog.Content class="sm:max-w-[425px]">
					<Dialog.Header>
						<Dialog.Title>Загрузить файл</Dialog.Title>
					</Dialog.Header>
					<form class="flex flex-col" action="">
						<div class="grid gap-4 py-4">
							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="file" class="text-right">Файл</Label
								>
								<Input
									id="file"
									type="file"
									class="col-span-3"
								/>
							</div>
						</div>
						<Button class="ml-auto" type="submit"
							>Save changes</Button
						>
					</form>
				</Dialog.Content>
			</Dialog.Root>
		</div>
		<div class="flex flex-col gap-1">
			{#if path != "/"}
				<div class="p-2 border-2 border-gray-500 rounded-md">
					<a
						href={"/server/" +
							$page.params.uuid +
							"/files" +
							path.substring(0, path.lastIndexOf("/"))}
						class=" text-blue-400 text-xl"
					>
						..
					</a>
				</div>
			{/if}
			{#each currentPathFiles as file}
				<div class="border-2 border-gray-500 rounded-md flex">
					{#if file.type == "file"}
						<a
							data-sveltekit-preload-data="tap"
							class="flex p-2 gap-1"
							href="/server/{$page.params
								.uuid}/file{path}/{file.name}?from={$page.url
								.pathname}"
						>
							{#if file.name.endsWith(".txt")}
								<FileText />
							{:else if file.name.endsWith(".json") || file.name.endsWith(".json5")}
								<FileJson />
							{:else if file.name.endsWith(".yml") || file.name.endsWith(".yaml") || file.name.endsWith(".toml") || file.name.endsWith(".cfg") || file.name.endsWith(".conf") || file.name.endsWith(".properties")}
								<FileSliders />
							{:else if file.name.endsWith(".png") || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") || file.name.endsWith(".gif") || file.name.endsWith(".webp")}
								<FileImage />
							{:else if file.name.endsWith(".zip") || file.name.endsWith(".rar") || file.name.endsWith(".7z") || file.name.endsWith(".tar") || file.name.endsWith(".gz")}
								<FileArchive />
							{:else if file.name.endsWith(".jar")}
								<FileCog />
							{:else}
								<File />
							{/if}
							<div>{file.name}</div>
						</a>
					{:else if file.type == "directory"}
						<a
							href={$page.url.pathname + "/" + file.name}
							class="p-2 text-blue-400 flex gap-1"
						>
							<FolderOpen />
							{file.name}
						</a>
					{:else}
						<div class="flex p-2 gap-1">
							<FileWarning />
							<div>Error</div>
						</div>
					{/if}
					<div class="px-2 ml-auto my-auto">
						{#if file.size}
							{formatBytes(file.size)}
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}{/if}
</div>
