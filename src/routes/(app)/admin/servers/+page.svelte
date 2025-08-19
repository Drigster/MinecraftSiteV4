<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import type { PageData } from "./$types";
	import { createServer } from "./servers.remote";
	import { page } from "$app/state";

	let { data }: { data: PageData } = $props();
</script>

<div class="contentBlock p-4">
	<h2 class="text-2xl">Сервера</h2>
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: "default" })}
			>Add server...</Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Создать новый сервер</Dialog.Title>
				<Dialog.Description>
					This action cannot be undone. This will permanently delete
					your account and remove your data from our servers.
				</Dialog.Description>
			</Dialog.Header>
			<form {...createServer}>
				<div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="name" class="text-right">Название</Label>
						<Input
							id="serverName"
							name="serverName"
							placeholder="Ванила"
							class="col-span-3"
							required
						/>
						{#if createServer.result?.error?.serverName}
							<span class="errorMessage">
								{createServer.result?.error?.serverName}
							</span>
						{/if}
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="description" class="text-right"
							>Описание</Label
						>
						<Textarea
							id="description"
							name="description"
							class="col-span-3"
						/>
						{#if createServer.result?.error?.description}
							<span class="errorMessage">
								{createServer.result?.error?.description}
							</span>
						{/if}
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
						<Label for="serverArt" class="text-right"
							>serverArt</Label
						>
						<span>Размер: 600x960</span>
						<Input
							id="serverArt"
							name="serverArt"
							type="file"
							class="col-span-3"
							required
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Button type="submit">Создать</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Название</Table.Head>
				<Table.Head>Статус</Table.Head>
				<Table.Head class="text-right"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data.servers as server (server.uuid)}
				<Table.Row>
					<Table.Cell
						><a href="{page.url.pathname}/{server.uuid}"
							>{server.name}</a
						></Table.Cell
					>
					<Table.Cell>{server.status}</Table.Cell>
					<Table.Cell class="text-right">
						<!-- {#if $sessionRemoveDelayed && $sessionRemoveFormId == session.id}
									<button
										class="ml-auto"
										formaction="?/removeSession"
										name="sessionId"
										value={session.id}
										onclick={() =>
											($sessionRemoveFormId = session.id)}
									>
										Удалить<img
											class="h-full mx-1 absolute left-full top-0"
											width="20"
											height="20"
											src={spiner}
											alt="Spiner icon"
										/>
									</button>
								{:else}
									<button
										class="ml-auto"
										formaction="?/removeSession"
										name="sessionId"
										value={session.id}
										onclick={() =>
											($sessionRemoveFormId = session.id)}
									>
										Удалить
									</button>
								{/if} -->
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
