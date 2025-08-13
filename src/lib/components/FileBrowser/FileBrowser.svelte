<script lang="ts">
	import { page } from "$app/state";
	import { formatBytes } from "$lib/utils";
	import {
		File as FileIcon,
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
	import UploadFileModal from "./UploadFileModal.svelte";
	import type { FileType } from "$lib/apiTypes";

	let {
		files,
	}: {
		files: FileType[];
	} = $props();
	let path = $derived("/" + page.params.path || "/");
	let viewType = $state<"dir" | "file">("dir");
</script>

<div>
	{#if viewType == "dir"}
		<div class="flex justify-between pb-1">
			<div class="p-2 flex">
				<a
					href={"/admin/server/" + page.params.uuid + "/files/"}
					class=" text-blue-400"
				>
					<House />
				</a>
				{#each path.split("/") as part, i}
					{#if i != path.split("/").length - 1}
						<a
							href={"/server/" +
								page.params.uuid +
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
			<!-- <UploadFileModal /> -->
		</div>
		<div class="flex flex-col gap-1">
			{#if path != "/"}
				<div class="p-2 border-2 border-gray-500 rounded-md">
					<a
						href={"/admin/server/" +
							page.params.uuid +
							"/files" +
							path.substring(0, path.lastIndexOf("/"))}
						class=" text-blue-400 text-xl"
					>
						..
					</a>
				</div>
			{/if}
			{#each files as file}
				<div class="border-2 border-gray-500 rounded-md flex">
					{#if file.type == "file"}
						<a
							data-sveltekit-preload-data="tap"
							class="flex p-2 gap-1"
							href="/admin/server/{page.params
								.uuid}/file{path}{file.name}?from={page.url
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
								<FileIcon />
							{/if}
							<div>{file.name}</div>
						</a>
					{:else if file.type == "directory"}
						<a
							href={page.url.pathname + "/" + file.name}
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
