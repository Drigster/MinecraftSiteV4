<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import type { PageData } from "./$types";
	import spiner from "$lib/assets/spiner.svg";

	export let data: PageData;

	const { form, enhance, errors, delayed } = superForm(data.form);
</script>

<div class="center authForm contentBlock full-top min-w-96">
	<h2
		class="text-center mx-auto uppercase text-3xl mb-8 text-accent font-bold"
	>
		Регистрация
	</h2>

	<form method="post" use:enhance>
		<div>
			<div class="inputBox">
				<input
					type="text"
					name="username"
					bind:value={$form.username}
					required
				/>
				<label for="username">Никнейм</label>
			</div>
			{#if $errors.username}
				<span class="errorMessage">{$errors.username}</span>
			{/if}
		</div>

		<div>
			<div class="inputBox">
				<input
					type="email"
					name="email"
					bind:value={$form.email}
					required
				/>
				<label for="email">Почта</label>
			</div>
			{#if $errors.email}
				<span class="errorMessage">{$errors.email}</span>
			{/if}
		</div>

		<div>
			<div class="inputBox">
				<input
					type="password"
					name="password"
					bind:value={$form.password}
					required
				/>
				<label for="password">Пароль</label>
			</div>
			<div class="inputBox pt-2">
				<input
					type="password"
					name="password2"
					bind:value={$form.password2}
					required
				/>
				<label for="password2">Повторить пароль</label>
			</div>
			{#if $errors.password || $errors.password2}
				<span class="errorMessage"
					>{$errors.password}{$errors.password2}</span
				>
			{/if}
		</div>

		<div class="flex justify-between">
			<span></span><a class="text-accent" href="/login">Вход</a>
		</div>

		<button type="submit">
			{#if $delayed}
				<span class="relative">
					Зарегистрироватся
					<img
						class="h-full mx-2 absolute left-full top-0"
						width="20"
						height="20"
						src={spiner}
						alt="Spiner icon"
					/>
				</span>
			{:else}
				Зарегистрироватся
			{/if}
		</button>
	</form>
</div>
