<script lang="ts">
	import logo from "$lib/assets/logo.svg";
	import type { User } from "lucia/dist/core";

	let h = $state(0);

	let { user }: { user: User | null } = $props();
</script>

<header class="fixed w-full">
	<nav class="navbar">
		<a class="nav-logo" href="/">
			<img class="h-8 w-8" src={logo} alt="" />
		</a>
		<ul class="nav-list">
			<li class="nav-item"><a class="nav-link" href="/">Главная</a></li>
			<li class="nav-item line-through">Правила</li>
			<li class="nav-item line-through">Сервера</li>
			<li class="nav-item rainbow">
				<a class="nav-link" href="/download">Скачать лаунчер</a>
			</li>
			{#if user?.role == "ADMIN"}
				<li class="nav-item">
					<a class="nav-link" href="/admin">Админка</a>
				</li>
			{/if}
			{#if user?.username != undefined}
				<li
					class="nav-item ml-auto text-white !my-0 flex"
					bind:clientHeight={h}
				>
					<span class="nav-link mt-5 mb-4 mr-8"
						><a href="/logout">Выйти</a></span
					>
					<a class="flex" href="/profile">
						<img
							class="m-auto border-2 border-accent rounded-full"
							src="/api/skin/head/{user.username}?{Date.now()}"
							height="32"
							width="32"
							alt="Player's skin head"
						/>
						<!-- height={h-16} width={h-16} -->
						<span class="nav-link mt-5 mb-4">{user.username}</span>
					</a>
				</li>
			{:else}
				<li class="nav-item ml-auto text-white">
					<a class="nav-link" href="/login">Войти</a>
				</li>
			{/if}
		</ul>
	</nav>
</header>

<style>
	.navbar {
		display: flex;
		text-transform: capitalize;
		color: var(--secondary);
	}

	.nav-list {
		display: flex;
		flex-grow: 1;
		padding-inline: 0.5rem;
		gap: 0.5rem;
		place-items: center;
	}

	.nav-item {
		margin-top: 1.25rem;
		margin-bottom: 1rem;
	}

	.nav-link {
		padding-inline: 0.5rem;
	}

	.nav-logo {
		margin-block: 1rem;
		margin-left: 1rem;
	}

	.rainbow {
		background-image: linear-gradient(
			to right,
			red,
			orange,
			yellow,
			green,
			blue,
			indigo,
			violet,
			indigo,
			blue,
			green,
			yellow,
			orange,
			red
		);
		background-size: auto auto;
		background-clip: border-box;
		background-size: 800% auto;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: move 80s linear infinite;
		display: inline-block;
	}

	.text-white {
		color: white;
	}

	@keyframes move {
		to {
			background-position: 800% center;
		}
	}
</style>
