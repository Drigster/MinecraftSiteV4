<script lang="ts">
	import { DateTime } from "luxon";
	import Skinview3d from "svelte-skinview3d";
	import { Trash } from "@o7/icon/heroicons";
	import { type PageData } from "./$types";
	import EditableLabel from "$lib/components/EditableLabel.svelte";
	import SendLabel from "$lib/components/SendLabel.svelte";
	import TextLabel from "$lib/components/TextLabel.svelte";
	import { ExclamationCircle } from "@o7/icon/heroicons";
	import * as Table from "$lib/components/ui/table";
	import { getFlash } from "sveltekit-flash-message";
	import { page } from "$app/state";
	import {
		changeEmail,
		changePassword,
		changeUsername,
		changeUUID,
		removeCape,
		removeSkin,
		verifyEmail,
	} from "./profile.remote";
	import SkinEditForm from "./forms/SkinEditForm.svelte";

	const flash = getFlash(page);

	let { data }: { data: PageData } = $props();

	let w = $state(0);

	let skinEditing = $state(false);
	let capeEditing = $state(false);
</script>

<svelte:head>
	<title>Профиль | Foxy.town</title>
</svelte:head>

<div class="flex flex-col gap-4">
	{#if !data.isSelf && data.userRole == "ADMIN"}
		<div class="contentBlock flex place-content-center items-center">
			<ExclamationCircle class="text-error" size="48" />
			<h2 class="text-error p-4 text-center text-xl">
				Вы просматриваете профиль игрока <span class="text-white"
					>{data.user!.username}</span
				>!
			</h2>
			<ExclamationCircle class="text-error" size="48" />
		</div>
	{/if}
	<div class="flex gap-4">
		<div class="contentBlock flex w-1/4 flex-col overflow-hidden p-4">
			<div class="mb-4 aspect-square w-full" bind:clientWidth={w}>
				<noscript>
					<div class="aspect-square w-full">
						<img
							class="m-auto h-full w-auto"
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
				<SkinEditForm bind:idEditing={skinEditing} />
			{:else}
				<div class="skin-buttons mb-1 gap-1">
					<button
						class="button h-full w-full"
						onclick={() => {
							skinEditing = true;
						}}>Изменить скин</button
					>
					<form
						{...removeSkin.enhance(async ({ form, submit }) => {
							try {
								await submit();
								form.reset();
							} catch (error) {
								$flash = {
									type: "success",
									message: "Ошибка, попробуйте позже",
								};
								console.log(error);
							}
						})}
					>
						<button class="button aspect-square h-full">
							<Trash class="m-auto" size="20" />
						</button>
					</form>
				</div>
			{/if}
			{#if capeEditing}
				<!-- <CapeEditForm
					data={data.capeChangeForm}
					bind:idEditing={capeEditing}
				/> -->
			{:else}
				<div class="skin-buttons mb-1 gap-1">
					<button
						class="button h-full w-full"
						disabled
						onclick={() => {
							capeEditing = true;
						}}>Изменить плащ</button
					>
					<form
						{...removeCape.enhance(async ({ form, submit }) => {
							try {
								await submit();
								form.reset();
							} catch (error) {
								$flash = {
									type: "success",
									message: "Ошибка, попробуйте позже",
								};
								console.log(error);
							}
						})}
					>
						<button class="button aspect-square h-full" disabled>
							<Trash class="m-auto" size="20" />
						</button>
					</form>
				</div>
			{/if}
		</div>
		<div class="contentBlock profileInfo grow p-4">
			<EditableLabel
				title="Никнейм"
				change={changeUsername}
				value={data.user!.username}
				input="username"
			/>
			{#if !data.isSelf}
				<EditableLabel
					title="UUID"
					change={changeUUID}
					value={data.user!.uuid}
					input="uuid"
				/>
			{/if}
			<SendLabel
				title="Почта"
				change={changeEmail}
				value={data.user!.email}
			/>
			<SendLabel
				title="Пароль"
				change={changePassword}
				value="●●●●●●●●"
			/>
			{#if data.isSelf}
				<SendLabel
					title="Статус аккаунта"
					change={verifyEmail}
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
					change={verifyEmail}
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
	<div class="contentBlock w-full p-4">
		<div class="">
			<h2 class="text-2xl">Активные сессии</h2>
			<h2 class="text-secondary text-[0.9rem]">
				Сессии автоматически удаляются после месяца неактивности.
			</h2>
		</div>
		<form method="post">
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
					{#each data.sessions as session (session.id)}
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
		</form>
	</div>
</div>

<style>
	.profileInfo {
		display: grid;
		grid-template-columns: 1fr minmax(30%, max-content);
	}

	.skin-buttons {
		display: grid;
		grid-template-columns: 1fr max-content;
	}
</style>
