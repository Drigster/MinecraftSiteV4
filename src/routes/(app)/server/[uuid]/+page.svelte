<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs";
	import type { PageData } from "./$types";
	import OnlineChart from "./OnlineChart.svelte";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Сервер | Foxy.town</title>
</svelte:head>

<div class="flex flex-col pb-4 pt-2 gap-4 s-zjveObUf2cI5">
	<div class="contentBlock flex p-2 gap-3">
		<div class="shrink-0 relative">
			<img
				class="rounded-md h-[60svh] w-auto aspect-[5/8]"
				src="/api/server/icon/${data.server.uuid}?${Date.now()}"
				alt=""
				width="300"
				height="480"
			/>
			<span
				class="absolute right-2 bottom-2 bg-background rounded-xl py-1 px-2 {data
					.server.status == 'HIDDEN'
					? 'text-green-600'
					: 'text-red-600'}">Онлайн</span
			>
			<!-- <Tooltip.Root>
				<Tooltip.Trigger
					class="absolute right-3 top-3 w-6 h-6 {data.server.status
						? 'bg-red-600'
						: ''} rounded-full border-black"
				></Tooltip.Trigger>
				<Tooltip.Content class="border-0 shadow-none p-1">
					<p>{data.server.status}</p>
				</Tooltip.Content>
			</Tooltip.Root> -->
		</div>
		<div class="flex flex-col gap-2">
			<div class="text-4xl">
				{data.server.name}<span class="pl-2 text-sm text-secondary"
					>{data.server.status}</span
				>
			</div>
			<p>{data.server.description}</p>
		</div>
	</div>

	<Tabs.Root
		value="online"
		class="contentBlock p-2 gap-3 h-[60vh] flex flex-col"
	>
		<Tabs.List class="bg-transparent text-primary justify-start">
			<Tabs.Trigger class="data-[state=active]:text-accent" value="online"
				>Онлайн</Tabs.Trigger
			>
			<Tabs.Trigger class="data-[state=active]:text-accent" value="mods"
				>Моды</Tabs.Trigger
			>
			<Tabs.Trigger
				class="data-[state=active]:text-accent"
				value="plugins">Плагины</Tabs.Trigger
			>
		</Tabs.List>
		<Tabs.Content class="p-2 m-0 h-full" value="online">
			<OnlineChart />
		</Tabs.Content>
		<Tabs.Content class="p-2 m-0" value="mods"
			>Change your password here.</Tabs.Content
		>
		<Tabs.Content class="p-2 m-0" value="plugins"
			>Change your password here.</Tabs.Content
		>
	</Tabs.Root>
</div>

<style>
	.profileInfo {
		display: grid;
		grid-template-columns: 1fr max-content;
	}

	.skin-buttons {
		display: grid;
		grid-template-columns: 1fr max-content;
	}
</style>
