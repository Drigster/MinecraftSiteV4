<script lang="ts">
	import {
		createRender,
		createTable,
		Render,
		Subscribe,
	} from "svelte-headless-table";
	import {
		addDataExport,
		addPagination,
		addSortBy,
		addTableFilter,
	} from "svelte-headless-table/plugins";
	import { get, readable } from "svelte/store";
	import * as Table from "$lib/components/ui/table/index.js";
	import Actions from "./data-table-actions.svelte";
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import * as Pagination from "$lib/components/ui/pagination";
	import { ArrowsUpDown } from "@o7/icon/heroicons";
	import { Input } from "$lib/components/ui/input";
	import type { PageData } from "./$types";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Label } from "$lib/components/ui/label";
	import Textarea from "$lib/components/ui/textarea/textarea.svelte";
	import { superForm } from "sveltekit-superforms";

	let { data }: { data: PageData } = $props();

	const {
		form: serverCreateForm,
		enhance: serverCreateEnhance,
		errors: serverCreateErrors,
	} = superForm(data.serverCreateForm, {
		resetForm: true,
	});

	const table = createTable(readable(data.servers), {
		sort: addSortBy({ disableMultiSort: true }),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue),
		}),
		export: addDataExport(),
	});

	const columns = table.createColumns([
		table.column({
			header: "Name",
			accessor: "name",
		}),
		table.column({
			header: "Owner",
			accessor: (server) => server.owner?.username,
		}),
		table.column({
			header: "Status",
			accessor: "status",
		}),
		table.column({
			header: "",
			id: "id",
			accessor: ({ id }) => id,
			cell: (cell) => {
				console.log(cell.row);
				return createRender(Actions, {
					id: cell.id,
					server_uuid: cell.row.original.uuid,
					owner_uuid: cell.row.original.owner?.uuid,
				});
			},
			plugins: {
				sort: {
					disable: true,
				},
			},
		}),
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const { pageIndex, pageSize } = pluginStates.page;
	let pageNumber = $state(1);
	$effect(() => {
		$pageIndex = pageNumber - 1;
	});
	const { sortKeys } = pluginStates.sort;
	let sortKey = $state("");
	$effect(() => {
		if ($sortKeys.length > 0) {
			sortKey = $sortKeys[0]!.id;
		}
	});
	const { filterValue } = pluginStates.filter;
</script>

<div>
	<div class="flex items-center justify-between py-4">
		<Input
			class="max-w-sm"
			placeholder="Search servers..."
			type="text"
			bind:value={$filterValue}
		/>
		<Dialog.Root>
			<Dialog.Trigger class={buttonVariants({ variant: "default" })}
				>Add server...</Dialog.Trigger
			>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Создать новый сервер</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently
						delete your account and remove your data from our
						servers.
					</Dialog.Description>
				</Dialog.Header>
				<form
					action="?/createServer"
					method="post"
					use:serverCreateEnhance
				>
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="name" class="text-right">Название</Label
							>
							<Input
								id="serverName"
								name="serverName"
								placeholder="Ванила"
								class="col-span-3"
								required
								bind:value={$serverCreateForm.serverName}
							/>
							{#if $serverCreateErrors.serverName}
								<span class="errorMessage">
									{$serverCreateErrors.serverName}
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
								bind:value={$serverCreateForm.description}
							/>
							{#if $serverCreateErrors.description}
								<span class="errorMessage">
									{$serverCreateErrors.description}
								</span>
							{/if}
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="ip" class="text-right">ИП:ПОРТ</Label>
							<Input
								id="ip"
								name="ip"
								placeholder="209.222.115.63"
								class="col-span-2"
								required
								bind:value={$serverCreateForm.ip}
							/>
							<Input
								id="port"
								name="port"
								placeholder="25565"
								class="col-span-1"
								bind:value={$serverCreateForm.port}
							/>
							{#if $serverCreateErrors.port || $serverCreateErrors.ip}
								<span class="errorMessage">
									{$serverCreateErrors.ip}
									{$serverCreateErrors.port}
								</span>
							{/if}
						</div>
					</div>
					<Dialog.Footer>
						<Button type="submit">Создать</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>
	<div>
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe
									attrs={cell.attrs()}
									let:attrs
									props={cell.props()}
									let:props
								>
									<Table.Head {...attrs}>
										{#if !get(cell.props()).sort.disabled}
											<Button
												variant="ghost"
												size="no_padding"
												on:click={props.sort.toggle}
											>
												<Render of={cell.render()} />
												<ArrowsUpDown
													class="ml-1 {sortKey ==
													cell.id
														? ''
														: 'text-gray-600'}"
													size="20"
												/>
											</Button>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs}>
							{#each row.cells as cell (cell.id)}
								<Subscribe
									attrs={cell.attrs()}
									let:attrs
									props={cell.props()}
								>
									<Table.Cell {...attrs}>
										{#if cell.id === "id"}
											<div class="text-right">
												<Render of={cell.render()} />
											</div>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-4 py-4">
		<Pagination.Root
			count={data.servers.length}
			perPage={$pageSize}
			let:pages
			let:currentPage
			bind:page={pageNumber}
		>
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton />
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === "ellipsis"}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item isVisible={currentPage == page.value}>
							<Pagination.Link
								{page}
								isActive={currentPage == page.value}
							>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton />
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	</div>
</div>
