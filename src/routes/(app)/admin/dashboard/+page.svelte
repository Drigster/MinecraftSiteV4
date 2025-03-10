<script lang="ts">
	import Counter from "$lib/components/Counter.svelte";
	import { ChartBar, ServerStack, User } from "@o7/icon/heroicons";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col justify-between contentBlock p-4">
	<div class="grid gap-2 grid-cols-5">
		<a class="contentBlock" href="./players">
			<div class="p-4 grid grid-rows-3 text-center">
				<User class="text-secondary m-auto" size="56" />
				<span class="text-6xl self-center">35</span>
				<div class="flex flex-col justify-evenly">
					<p class="text-secondary mb-1">Игроков</p>
					<p class="text-green-400">+2 за неделю</p>
				</div>
			</div>
		</a>
		<a class="contentBlock" href="./servers">
			<div class="p-4 grid grid-rows-3 text-center">
				<ServerStack class="text-secondary m-auto" size="56" />
				<span class="text-6xl self-center"
					><Counter bind:value={data.servers_count} /></span
				>
				<div class="flex flex-col justify-evenly">
					<p class="text-secondary mb-1">Сервера</p>
				</div>
			</div>
		</a>
		<div class="p-4 contentBlock grid grid-rows-3 text-center">
			<ChartBar class="text-secondary m-auto" size="56" />
			<span class="text-6xl self-center"
				><Counter bind:value={data.users_count} /></span
			>
			<div class="flex flex-col justify-evenly">
				<p class="text-secondary mb-1">Онлайн</p>
				<p class="text-green-400">+2 за час</p>
			</div>
		</div>
		<div class="contentBlock col-span-2 row-span-2"></div>
		<div class="p-4 contentBlock grid grid-rows-3 text-center">
			<ServerStack class="text-secondary m-auto" size="56" />
			<span class="text-6xl self-center">2</span>
			<div class="flex flex-col justify-evenly">
				<p class="text-secondary mb-1">Сервера</p>
			</div>
		</div>
	</div>
</div>
