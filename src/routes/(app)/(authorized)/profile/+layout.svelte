<script lang="ts">
	import { DateTime } from "luxon";
	import { Render, WalkingAnimation, RunningAnimation } from "skin3d";
	import {
		ChevronsRight,
		Pause,
		Pencil,
		Play,
		RefreshCw,
		RefreshCwOff,
	} from "@o7/icon/lucide";
	import Button from "$lib/components/Button.svelte";
	import { page } from "$app/state";
	import { resolve } from "$app/paths";
	import { untrack } from "svelte";

	let { data, children } = $props();
	const modal_open = $derived(page.route.id != "/(app)/(authorized)/profile");

	let w = $state(0);
	let h = $state(0);

	let skinRotate = $state(false);
	let skinPause = $state(false);
	let skinAnim = $state<"walk" | "run" | "idle">("walk");
	let viewer: Render | undefined = $state(undefined);
	let canvas: HTMLCanvasElement;

	const toggleRotate = () => {
		skinRotate = !skinRotate;
		if (viewer) {
			viewer.autoRotate = skinRotate;
		}
	};
	const cycleAnim = () => {
		if (viewer) {
			let anim;
			switch (skinAnim) {
				case "walk":
					skinAnim = "run";
					anim = new RunningAnimation();
					anim.speed = 0.6;
					break;
				case "run":
					skinAnim = "idle";
					anim = null;
					break;
				case "idle":
					skinAnim = "walk";
					anim = new WalkingAnimation();
					anim.speed = 0.8;
					break;
			}
			viewer.animation = anim;
		}
	};
	const playPause = () => {
		skinPause = !skinPause;
		if (viewer && viewer.animation) {
			viewer.animation.paused = skinPause;
		}
	};

	$effect(() => {
		if (w == 0 || h == 0) {
			return;
		}
		let username = data.user.username;
		untrack(() => {
			viewer = new Render({ canvas, width: w, height: h });
			viewer.loadSkin(`/api/skin/${username}?${Date.now()}`);
			viewer.loadCape(`/api/cape/${username}?${Date.now()}`);
			let anim = new WalkingAnimation();
			anim.speed = 0.8;
			viewer.animation = anim;
			viewer.autoRotate = skinRotate;
			viewer.zoom = 0.85;
		});
	});

	let filteredSessions = $derived.by(() => {
		let arr = data.sessions;
		let index = data.sessions.findIndex(
			(e) => e.id == data.current_session_id,
		);

		const [item] = arr.splice(index, 1);
		arr.unshift(item!);
		return arr;
	});
</script>

<svelte:head>
	<title>Профиль | Foxy.town</title>
</svelte:head>

<div class="flex flex-col gap-4">
	<div class="flex gap-4">
		<section
			class="bg-blur relative flex aspect-[2/3] w-1/4 flex-col rounded-lg bg-background/60"
		>
			<noscript class="h-full w-full">
				<img
					class="m-auto h-full w-auto"
					src="/api/skin/body/{data.user.username}?{Date.now()}"
					alt=""
					width="32"
					height="48"
				/>
			</noscript>
			<div
				class="h-full w-full"
				bind:clientWidth={w}
				bind:clientHeight={h}
			>
				<canvas bind:this={canvas} width={w} height={h}></canvas>
			</div>
			<div class="absolute bottom-4 left-4 right-4 flex gap-1">
				{#if viewer != undefined}
					<Button class="!p-1.5" onclick={playPause}>
						{#if skinPause}
							<Play size="20" />
						{:else}
							<Pause size="20" />
						{/if}
					</Button>
					<Button class="!p-1.5" onclick={toggleRotate}>
						{#if skinRotate}
							<RefreshCwOff size="20" />
						{:else}
							<RefreshCw size="20" />
						{/if}
					</Button>
					<Button class="!p-1.5" onclick={cycleAnim}>
						<ChevronsRight size="20" />
					</Button>
				{/if}
				<div class="ml-auto">
					<Button href="/profile/editSkin" class="!p-1.5">
						<Pencil size="20" />
					</Button>
				</div>
			</div>
		</section>
		<section
			class="bg-blur flex grow flex-col gap-4 rounded-lg bg-background/60 p-4"
		>
			<ul class="flex h-full flex-col justify-between">
				<li class="flex content-center items-baseline gap-1">
					<span>Никнейм</span>
					<span
						class="flex-1 border-b-2 border-dotted border-text-muted/35"
					></span>
					<span>
						{data.user!.username}
					</span>
				</li>
				<li class="flex content-center items-baseline gap-1">
					<span>Роль</span>
					<span
						class="flex-1 border-b-2 border-dotted border-text-muted/35"
					></span>
					<span>
						{data.user!.role}
					</span>
				</li>
				<li class="flex content-center items-baseline gap-1">
					<span>Почта</span>
					<span
						class="flex-1 border-b-2 border-dotted border-text-muted/35"
					></span>
					<span>
						{data.user!.email}
					</span>
				</li>
				<li class="flex content-center items-baseline gap-1">
					<span>Статус аккаунта</span>
					<span
						class="flex-1 border-b-2 border-dotted border-text-muted/35"
					></span>
					<span>
						{data.user!.verified
							? "Верифицирован"
							: "Не верифицирован"}
					</span>
				</li>
				<li class="flex content-center items-baseline gap-1">
					<span>Дата регистрации</span>
					<span
						class="flex-1 border-b-2 border-dotted border-text-muted/35"
					></span>
					<span>
						{DateTime.fromISO(data.user!.regDate)
							.setLocale("ru")
							.toFormat("d MMMM yyyy в HH:mm")}
					</span>
				</li>
				<li class="flex content-center items-baseline gap-1">
					<span>Последняя активность</span>
					<span
						class="flex-1 border-b-2 border-dotted border-text-muted/35"
					></span>
					<span>
						{#if data.user!.lastPlayed}
							{DateTime.fromISO(data.user!.lastPlayed)
								.setLocale("ru")
								.toFormat("d MMMM yyyy в HH:mm")}
						{:else}
							Отсутствует
						{/if}
					</span>
				</li>
			</ul>
			<div class="flex gap-1">
				<Button href="/profile/editUsername">Сменить никнейм</Button>
				<Button href="/profile/editEmail">Сменить почту</Button>
				<Button href="/profile/editPassword">Сменить пароль</Button>
				<!-- <Button>Добавить 2FA</Button> -->
			</div>
		</section>
	</div>
	<section class="bg-blur w-full rounded-lg bg-background/60 p-4">
		<div class="">
			<h2 class="text-2xl font-bold text-accent">Активные сессии</h2>
			<h2 class="text-secondary text-text-muted">
				Сессии автоматически удаляются после месяца неактивности.
			</h2>
		</div>
		<form method="post">
			<table
				class="mt-4 grid grid-cols-[2fr_2fr_1fr_1fr_2fr_auto] gap-x-4 rounded-lg text-sm"
			>
				<thead class="col-span-full grid grid-cols-subgrid">
					<tr
						class="col-span-full grid grid-cols-subgrid border-b border-text-muted p-2 text-left font-semibold tracking-wide"
					>
						<th>Девайс</th>
						<th>Локация</th>
						<th>IP</th>
						<th>Тип сессии</th>
						<th>Последний вход </th>
						<th></th>
					</tr>
				</thead>
				<tbody class="col-span-full grid grid-cols-subgrid">
					{#each filteredSessions as session (session.id)}
						<tr
							class="col-span-full grid grid-cols-subgrid items-center border-text-muted p-2 text-text-muted [&:not(:last-child)]:border-b"
						>
							<td>{session.device || "-"}</td>
							<td>{session.location || "-"}</td>
							<td>{session.ip || "-"}</td>
							<td
								>{session.type == "SITE"
									? "Сайт"
									: "Лаунчер"}</td
							>
							<td>
								{#if session.id == data.current_session_id}
									<span class="text-accent">Текущая</span>
								{:else}
									{DateTime.fromISO(session.last_login)
										.setLocale("ru")
										.toFormat("d MMMM yyyy в HH:mm")}
								{/if}
							</td>
							<td>
								{#if session.id != data.current_session_id}
									<button class="text-text">Удалить</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</form>
	</section>
</div>
{#if modal_open}
	<a
		draggable="false"
		href={resolve("/profile")}
		data-sveltekit-noscroll
		aria-hidden="true"
		class="fixed inset-0 z-10 cursor-default"
	></a>
	<div
		class="fixed left-1/2 top-1/2 z-20 min-w-96 -translate-x-1/2 -translate-y-1/2"
	>
		{@render children()}
	</div>
{/if}
