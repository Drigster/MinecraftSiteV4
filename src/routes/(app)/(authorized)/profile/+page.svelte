<script lang="ts">
	import { DateTime } from "luxon";
	import { fileProxy, superForm } from "sveltekit-superforms";
	import Skinview3d from "svelte-skinview3d";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Trash, XMark, Check } from "@steeze-ui/heroicons";
	import spiner from "$lib/assets/spiner.svg";

	export let data;
	let w;

	const {
		formId: sessionRemoveFormId,
		enhance: sessionRemoveEnhance,
		delayed: sessionRemoveDelayed,
	} = superForm(data.sessionRemoveForm, {
		resetForm: true,
	});

	const {
		formId: skinRemoveFormId,
		enhance: skinRemoveEnhance,
		delayed: skinRemoveDelayed,
	} = superForm(data.skinRemoveForm, {
		resetForm: true,
	});

	const {
		formId: capeRemoveFormId,
		enhance: capeRemoveEnhance,
		delayed: capeRemoveDelayed,
	} = superForm(data.capeRemoveForm, {
		resetForm: true,
	});

	let usernameEditing: boolean;
	const {
		enhance: usernameChangeEnhance,
		delayed: usernameChangeDelayed,
		errors: usernameChangeErrors,
	} = superForm(data.usernameChangeForm, {
		resetForm: true,
		onUpdated: () => {
			usernameEditing = false;
		},
	});

	let skinEditing: boolean;
	const {
		form: skinChangeForm,
		enhance: skinChangeEnhance,
		delayed: skinChangeDelayed,
		errors: skinChangeErrors,
	} = superForm(data.skinChangeForm, {
		resetForm: true,
		onUpdated: () => {
			skinEditing = false;
		},
	});
	const skinChangefile = fileProxy(skinChangeForm, "skin");

	let capeEditing: boolean;
	const {
		form: capeChangeForm,
		enhance: capeChangeEnhance,
		delayed: capeChangeDelayed,
		errors: capeChangeErrors,
	} = superForm(data.capeChangeForm, {
		resetForm: true,
		onUpdated: () => {
			capeEditing = false;
		},
	});
	const capeChangefile = fileProxy(capeChangeForm, "cape");
</script>

<div class="profile">
	<div class="flex gap-4">
		<div class="contentBlock p-4 overflow-hidden w-1/4 flex flex-col">
			<div class="w-full aspect-square mb-4" bind:clientWidth={w}>
				<noscript>
					<div class="w-full aspect-square">
						<img
							class="h-full w-auto m-auto"
							src="/api/skin/body/{data.user.username}?{Date.now()}"
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
				<form
					class="inline-change-form skin-buttons mb-1"
					action="?/changeSkin"
					method="POST"
					enctype="multipart/form-data"
					use:skinChangeEnhance
				>
					<button type="submit" disabled style="display: none" aria-hidden="true"
					></button>
					<input
						class="w-full button"
						type="file"
						name="skin"
						accept="image/png"
						bind:files={$skinChangefile}
					/>
					<div>
						{#if $skinChangeDelayed}
							<button class="change-icon-button" type="submit" disabled>
								<img
									class="h-full w-full"
									width="20"
									height="20"
									src={spiner}
									alt="Spiner icon"
								/>
							</button>
						{:else}
							<button class="change-icon-button" type="submit">
								<Icon class="h-full w-full" size="20" src={Check} theme="solid" />
							</button>
						{/if}
						<button
							class="change-icon-button"
							type="button"
							on:click={() => {
								skinEditing = false;
							}}
							><Icon
								class="h-full w-full"
								size="20"
								src={XMark}
								theme="solid"
							/></button
						>
					</div>
				</form>
			{:else}
				<div class="skin-buttons mb-1 gap-1">
					<button
						class="button w-full h-full"
						on:click={() => {
							skinEditing = true;
						}}>Изменить скин</button
					>
					<form method="POST" action="?/deleteSkin" use:skinRemoveEnhance>
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
								<Icon class="h-full w-full" size="20" src={Trash} theme="solid" />
							{/if}
						</button>
					</form>
				</div>
			{/if}
			{#if $skinChangeErrors.skin}
				<span> </span>
				<span class="errorMessage">
					{$skinChangeErrors.skin}
				</span>
			{/if}
			{#if capeEditing}
				<form
					class="inline-change-form skin-buttons mb-1"
					action="?/changeCape"
					method="POST"
					enctype="multipart/form-data"
					use:capeChangeEnhance
				>
					<button type="submit" disabled style="display: none" aria-hidden="true"
					></button>
					<input
						class="w-full button"
						type="file"
						name="cape"
						accept="image/png"
						bind:files={$capeChangefile}
					/>
					<div>
						{#if $capeChangeDelayed}
							<button class="change-icon-button" type="submit" disabled>
								<img
									class="h-full w-full"
									width="20"
									height="20"
									src={spiner}
									alt="Spiner icon"
								/>
							</button>
						{:else}
							<button class="change-icon-button" type="submit">
								<Icon class="h-full w-full" size="20" src={Check} theme="solid" />
							</button>
						{/if}
						<button
							class="change-icon-button"
							type="button"
							on:click={() => {
								capeEditing = false;
							}}
							><Icon
								class="h-full w-full"
								size="20"
								src={XMark}
								theme="solid"
							/></button
						>
					</div>
				</form>
			{:else}
				<div class="skin-buttons mb-1 gap-1">
					<button
						class="button w-full h-full"
						on:click={() => {
							capeEditing = true;
						}}>Изменить плащ</button
					>
					<form method="POST" action="?/deleteCape" use:capeRemoveEnhance>
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
								<Icon class="h-full w-full" size="20" src={Trash} theme="solid" />
							{/if}
						</button>
					</form>
				</div>
			{/if}
			{#if $capeChangeErrors.cape}
				<span> </span>
				<span class="errorMessage">
					{$capeChangeErrors.cape}
				</span>
			{/if}
		</div>
		<div class="contentBlock p-4 profileInfo grow">
			<div>
				<span class="py-[2px]">Никнейм</span>
				<span>
					{#if usernameEditing}
						<form
							class="inline-change-form"
							action="?/changeUsername"
							method="POST"
							use:usernameChangeEnhance
						>
							<button type="submit" disabled style="display: none" aria-hidden="true"
							></button>
							<input type="text" name="username" value={data.user.username} />
							{#if $usernameChangeDelayed}
								<button class="change-icon-button" type="submit" disabled>
									<img
										class="h-full w-full"
										width="20"
										height="20"
										src={spiner}
										alt="Spiner icon"
									/>
								</button>
							{:else}
								<button class="change-icon-button" type="submit">
									<Icon
										class="h-full w-full"
										size="20"
										src={Check}
										theme="solid"
									/>
								</button>
							{/if}
							<button
								class="change-icon-button"
								type="button"
								on:click={() => {
									usernameEditing = false;
								}}
								><Icon
									class="h-full w-full"
									size="20"
									src={XMark}
									theme="solid"
								/></button
							>
						</form>
					{:else}
						<span>
							{data.user.username}
						</span>
						<button
							type="button"
							class="change-button"
							on:click={() => {
								usernameEditing = true;
							}}
						>
							Изменить
						</button>
					{/if}
				</span>
				{#if $usernameChangeErrors.username}
					<span> </span>
					<span class="errorMessage">
						{$usernameChangeErrors.username}
					</span>
				{/if}
			</div>
			<div>
				<span>Почта</span>
				<span>
					<span>
						{data.user.email}
					</span>
					<button type="button" class="change-button">Изменить</button>
				</span>
			</div>
			<div>
				<span>Пароль</span>
				<span>
					<span> ●●●●●●●● </span>
					<button type="button" class="change-button">Изменить</button>
				</span>
			</div>
			<div>
				<span>Статус аккаунта</span>
				<span>
					{#if data.user.verified}
						<span class="text-success"> Верифицирован </span>
					{:else}
						<span class="text-warning"> Не верифицирован </span>
						<button type="button" class="change-button"> Верифицировать </button>
					{/if}
				</span>
				<!-- <span class="text-red-500">
					Забанен
				</span> -->
			</div>
			<div>
				<span>Дата регистрации</span>
				<span
					>{DateTime.fromJSDate(data.user.regDate)
						.setLocale("ru")
						.toLocaleString({})}</span
				>
			</div>
			<div>
				<span>Последняя активность</span>
				<span>
					{#if data.user.lastPlayed}
						{DateTime.fromJSDate(data.user.lastPlayed).setLocale("ru").toLocaleString()}
					{:else}
						Отсуцтвует
					{/if}
				</span>
			</div>
		</div>
	</div>
	<div class="contentBlock p-4 w-full">
		<div class="">
			<h2 class="text-2xl">Активные сессии</h2>
			<h2 class="text-secondary text-[0.9rem]">
				Сессии автоматически удаляются после месяца неактивности.
			</h2>
		</div>
		<form method="POST" use:sessionRemoveEnhance>
			<ul class="sessionList">
				{#each data.user.sessions as session, i}
					<li class={data.currentSession == session.token ? "" : ""}>
						<span>{session.name}</span>
						<span>{session.ip}</span>
						<span>
							{#if data.currentSession == session.token}
								<span class="text-accent"> Текущая </span>
							{:else}
								{DateTime.fromJSDate(session.lastLogin)
									.setLocale("ru")
									.toRelativeCalendar()}
							{/if}</span
						>
						{#if $sessionRemoveDelayed && $sessionRemoveFormId == session.token}
							<button class="button"><img src={spiner} alt="Spiner icon" /></button>
						{:else}
							<button
								class="ml-auto"
								formaction="?/removeSession"
								name="token"
								value={session.token}
								on:click={() => ($sessionRemoveFormId = session.token)}
							>
								Удалить
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		</form>
	</div>
</div>

<style>
	.profile > * {
		padding-bottom: 1rem;
	}

	.sessionList {
		display: grid;
		grid-template-columns: repeat(3, max-content) 1fr;
		max-height: 40svh;
		max-height: 40vh;
		overflow: auto;
		padding-top: 1rem;
	}

	.sessionList li {
		grid-column: span 4;
		display: grid;
		grid-template-columns: subgrid;
		gap: 2rem;
		padding: 0.5rem;
	}

	.sessionList li:nth-of-type(n + 2) {
		border-top: solid 1px;
	}

	.profileInfo {
		display: grid;
		grid-template-columns: 1fr max-content;
	}

	.profileInfo > * {
		display: grid;
		grid-column: span 2;
		grid-template-columns: subgrid;
		align-content: center;
	}

	.skin-buttons {
		display: grid;
		grid-template-columns: 1fr max-content;
	}

	.change-button {
		font-size: 0.75rem;
		color: var(--secondary);
		margin-inline: 0.25rem;
	}

	.change-button:hover {
		color: white;
	}

	.change-icon-button {
		height: 100%;
		padding: 0.1rem;
	}

	.inline-change-form {
		display: grid;
		grid-template-columns: 1fr max-content max-content;
		gap: 0.25rem;
	}

	.inline-change-form input {
		border: solid 2px var(--accent);
		border-radius: 0.5rem;
		background-color: var(--background);
		padding-left: 0.25rem;
	}
</style>
