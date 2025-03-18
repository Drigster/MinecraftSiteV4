<script lang="ts">
	import { DateTime } from "luxon";
	import { superForm } from "sveltekit-superforms";
	import Skinview3d from "svelte-skinview3d";
	import { Trash } from "@o7/icon/heroicons";
	import spiner from "$lib/assets/spiner.svg";
	import { type PageData } from "./$types";
	import EditableLabel from "$lib/components/EditableLabel.svelte";
	import SendLabel from "$lib/components/SendLabel.svelte";
	import TextLabel from "$lib/components/TextLabel.svelte";
	import { ExclamationCircle } from "@o7/icon/heroicons";
	import * as Table from "$lib/components/ui/table";
	import { getFlash } from "sveltekit-flash-message";
	import { page } from "$app/stores";
	import SkinEditForm from "./forms/SkinEditForm.svelte";
	import CapeEditForm from "./forms/CapeEditForm.svelte";

	const flash = getFlash(page);

	let { data }: { data: PageData } = $props();
	let w = $state(0);

	const {
		formId: sessionRemoveFormId,
		enhance: sessionRemoveEnhance,
		delayed: sessionRemoveDelayed,
	} = superForm(data.sessionRemoveForm, {
		resetForm: true,
		onUpdated({ form }) {
			if (form.message) {
				$flash = {
					type: form.message.type,
					message: form.message.text,
					title: form.message.title,
				};
			}
		},
		onError({ result }) {
			$flash = { type: "error", message: result.error.message };
		},
	});

	const { enhance: skinRemoveEnhance, delayed: skinRemoveDelayed } =
		superForm(data.skinRemoveForm, {
			resetForm: true,
			onUpdated({ form }) {
				if (form.message) {
					$flash = {
						type: form.message.type,
						message: form.message.text,
						title: form.message.title,
					};
				}
			},
			onError({ result }) {
				$flash = {
					type: "error",
					message: result.error.message,
				};
			},
		});

	const { enhance: capeRemoveEnhance, delayed: capeRemoveDelayed } =
		superForm(data.capeRemoveForm, {
			resetForm: true,
			onUpdated({ form }) {
				if (form.message) {
					$flash = {
						type: form.message.type,
						message: form.message.text,
						title: form.message.title,
					};
				}
			},
			onError({ result }) {
				$flash = {
					type: "error",
					message: result.error.message,
				};
			},
		});

	let skinEditing = $state(false);
	let capeEditing = $state(false);
</script>

<svelte:head>
	<title>Профиль | Foxy.town</title>
</svelte:head>

<div class="flex flex-col gap-4">
	{#if !data.isSelf && data.userRole == "ADMIN"}
		<div class="contentBlock flex items-center place-content-center">
			<ExclamationCircle class="text-error" size="48" />
			<h2 class="text-xl text-center text-error p-4">
				Вы просматриваете профиль игрока <span class="text-white"
					>{data.user!.username}</span
				>!
			</h2>
			<ExclamationCircle class="text-error" size="48" />
		</div>
	{/if}
	<div class="flex gap-4">
		<div class="contentBlock p-4 overflow-hidden w-1/4 flex flex-col">
			<div class="w-full aspect-square mb-4" bind:clientWidth={w}>
				<noscript>
					<div class="w-full aspect-square">
						<img
							class="h-full w-auto m-auto"
							src="/api/skin/body/{data.user
								.username}?{Date.now()}"
							alt=""
							width="128"
							height="256"
						/>
					</div>
				</noscript>
				<Skinview3d
					class="w-full"
					width={w}
					height={w}
					skinUrl="/api/skin/{data.user.username}?{Date.now()}"
				/>
			</div>
			{#if skinEditing}
				<SkinEditForm
					data={data.skinChangeForm}
					bind:idEditing={skinEditing}
				/>
			{:else}
				<div class="skin-buttons mb-1 gap-1">
					<button
						class="button w-full h-full"
						onclick={() => {
							skinEditing = true;
						}}>Изменить скин</button
					>
					<form
						method="post"
						action="?/deleteSkin"
						use:skinRemoveEnhance
					>
						<input type="hidden" name="skinRemove" value="remove" />
						<button class="button aspect-square h-full">
							{#if $skinRemoveDelayed}
								<img
									class="h-full w-full"
									width="20"
									height="20"
									src={spiner}
									alt="Spiner icon"
								/>
							{:else}
								<Trash class="m-auto" size="20" />
							{/if}
						</button>
					</form>
				</div>
			{/if}
			{#if capeEditing}
				<CapeEditForm
					data={data.capeChangeForm}
					bind:idEditing={capeEditing}
				/>
			{:else}
				<div class="skin-buttons mb-1 gap-1">
					<button
						class="button w-full h-full"
						onclick={() => {
							capeEditing = true;
						}}>Изменить плащ</button
					>
					<form
						method="post"
						action="?/deleteCape"
						use:capeRemoveEnhance
					>
						<input type="hidden" name="capeRemove" value="remove" />
						<button class="button aspect-square h-full">
							{#if $capeRemoveDelayed}
								<img
									class="h-full w-full"
									width="20"
									height="20"
									src={spiner}
									alt="Spiner icon"
								/>
							{:else}
								<Trash class="m-auto" size="20" />
							{/if}
						</button>
					</form>
				</div>
			{/if}
		</div>
		<div class="contentBlock p-4 profileInfo grow">
			<EditableLabel
				title="Никнейм"
				formData={data.usernameChangeForm}
				action={data.isSelf
					? "?/changeUsername"
					: "?/adminChangeUsername"}
				value={data.user!.username}
				input="username"
			/>
			{#if !data.isSelf}
				<EditableLabel
					title="UUID"
					formData={data.uuidChangeForm}
					action="?/adminChangeUUID"
					value={data.user!.uuid}
					input="uuid"
				/>
			{/if}
			<EditableLabel
				title="Почта"
				formData={data.emailChangeForm}
				action="?/adminChangeEmail"
				value={data.user!.email}
				input="email"
			/>
			<EditableLabel
				title="Пароль"
				formData={data.passwordChangeForm}
				action="?/adminChangePassword"
				value="●●●●●●●●"
				input="password"
			/>
			{#if data.isSelf}
				<SendLabel
					title="Статус аккаунта"
					form={data.emailVerifyForm}
					action="?/verifyEmail"
					value={data.user!.verified
						? "Верифицирован"
						: "Не верифицирован"}
					valueClass={data.user!.verified
						? "text-[#26c90a]"
						: "text-[#e5e106]"}
					hidden={data.user!.verified}
					buttonText="Верифицировать"
				/>
			{:else}
				<SendLabel
					title="Статус аккаунта"
					form={data.emailVerifyForm}
					action={data.user!.verified
						? "?/adminUnVerifyEmail"
						: "?/adminVerifyEmail"}
					value={data.user!.verified
						? "Верифицирован"
						: "Не верифицирован"}
					valueClass={data.user!.verified
						? "text-[#26c90a]"
						: "text-[#e5e106]"}
					buttonText={data.user!.verified
						? "Деверифицировать"
						: "Верифицировать"}
				/>
			{/if}
			<TextLabel title="Дата регистрации">
				{DateTime.fromSQL(data.user!.regDate)
					.setLocale("ru")
					.toLocaleString(DateTime.DATETIME_SHORT)}
			</TextLabel>
			<TextLabel title="Последняя активность">
				{#if data.user!.lastPlayed}
					{DateTime.fromSQL(data.user!.lastPlayed)
						.setLocale("ru")
						.toLocaleString()}
				{:else}
					Отсутствует
				{/if}
			</TextLabel>
		</div>
	</div>
	<div class="contentBlock p-4 w-full">
		<div class="">
			<h2 class="text-2xl">Активные сессии</h2>
			<h2 class="text-secondary text-[0.9rem]">
				Сессии автоматически удаляются после месяца неактивности.
			</h2>
		</div>
		<form method="post" use:sessionRemoveEnhance>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Тип сессии</Table.Head>
						<Table.Head>Девайс</Table.Head>
						<Table.Head>Локация</Table.Head>
						<Table.Head>IP</Table.Head>
						<Table.Head>Последний вход</Table.Head>
						<Table.Head class="text-right"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.sessions as session}
						<Table.Row>
							<Table.Cell>{session.type}</Table.Cell>
							<Table.Cell>{session.device}</Table.Cell>
							<Table.Cell>{session.location}</Table.Cell>
							<Table.Cell></Table.Cell>
							<Table.Cell>
								{#if data.currentSession?.id == session.id}
									<span class="text-accent">Текущая</span>
								{:else}
									{@const lastLogin = DateTime.fromSQL(
										session.last_login,
									)
										.setLocale("ru")
										.toRelativeCalendar()}
									{#if lastLogin == null}
										{session.last_login}
									{:else}
										{lastLogin.charAt(0).toUpperCase() +
											lastLogin.slice(1)}
									{/if}
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								{#if $sessionRemoveDelayed && $sessionRemoveFormId == session.id}
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
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</form>
	</div>
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
