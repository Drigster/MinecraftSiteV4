<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs";
	import type { PageData } from "./$types";
	import OnlineChart from "./OnlineChart.svelte";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Сервер | Foxy.town</title>
</svelte:head>

<div class="s-zjveObUf2cI5 flex flex-col gap-4 pb-4 pt-2">
	<div class="contentBlock flex gap-3 p-2">
		<div class="relative shrink-0">
			<img
				class="aspect-[5/8] h-[60svh] w-auto rounded-md"
				src="/api/server/icon/${data.server.uuid}?${Date.now()}"
				alt=""
				width="300"
				height="480"
			/>
			<span
				class="absolute bottom-2 right-2 rounded-xl bg-background px-2 py-1 {data
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
				{data.server.name}<span class="text-secondary pl-2 text-sm"
					>{data.server.status}</span
				>
			</div>
			<p>{data.server.description}</p>
		</div>
	</div>

	<Tabs.Root
		value="online"
		class="contentBlock flex h-[60vh] flex-col gap-3 p-2"
	>
		<Tabs.List class="text-primary justify-start bg-transparent">
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
		<Tabs.Content class="m-0 h-full p-2" value="online">
			<OnlineChart />
		</Tabs.Content>
		<Tabs.Content class="m-0 p-2" value="mods"
			>Change your password here.</Tabs.Content
		>
		<Tabs.Content class="m-0 p-2" value="plugins"
			>Change your password here.</Tabs.Content
		>
	</Tabs.Root>
</div>
