<script lang="ts">
	import logo from "$lib/assets/logo.svg";
	import type { User } from "$lib/server/auth";
	import { logout } from "$lib/auth.remote";
	import { resolve } from "$app/paths";

	let { user }: { user: User | null } = $props();
</script>

<header class="fixed z-50 w-full">
	<nav class="flex capitalize text-text-muted">
		<a class="m-4" href={resolve("/")}>
			<img class="h-8 w-8" src={logo} alt="" />
		</a>
		<ul class="flex flex-grow place-items-center gap-2 px-2">
			<li class="mb-4 mt-5">
				<a class="px-2 hover:text-text" href={resolve("/")}>Главная</a>
			</li>
			<li class="mb-4 mt-5 line-through">Правила</li>
			<li class="mb-4 mt-5 line-through">Сервера</li>
			<li class="rainbow mb-4 mt-5">
				<a class="px-2" href={resolve("/")}>Скачать лаунчер</a>
			</li>
			{#if user?.role == "ADMIN"}
				<li class="mb-4 mt-5">
					<a class="px-2 hover:text-text" href={resolve("/")}
						>Админка</a
					>
				</li>
			{/if}
			{#if user?.username != undefined}
				<li class="ml-auto flex">
					<span class="mb-4 mr-8 mt-5 px-2">
						<form {...logout}>
							<button class="hover:text-text" type="submit"
								>Выйти</button
							>
						</form>
					</span>
					<a class="flex hover:text-text" href={resolve("/profile")}>
						<img
							class="m-auto rounded-md border-2 border-accent"
							src="/api/skin/head/{user.username}?{Date.now()}"
							height="32"
							width="32"
							alt="Head"
						/>
						<!-- height={h-16} width={h-16} -->
						<span class="mb-4 mt-5 px-2">{user.username}</span>
					</a>
				</li>
			{:else}
				<li class="nav-item ml-auto hover:text-text">
					<a class="px-2" href={resolve("/login")}>Войти</a>
				</li>
			{/if}
		</ul>
	</nav>
</header>

<style>
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

	@keyframes move {
		to {
			background-position: 800% center;
		}
	}
</style>
