<script lang="ts">
	import spiner from "$lib/assets/spiner.svg";
	import { getFlash } from "sveltekit-flash-message";
	import { register } from "../auth.remote";
	import { page } from "$app/state";

	const flash = getFlash(page);
</script>

<svelte:head>
	<title>Регистрация | Foxy.town</title>
</svelte:head>

<div class="center authForm contentBlock full-top min-w-96">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Регистрация
	</h2>

	<form
		{...register.enhance(async ({ form, submit }) => {
			try {
				await submit();
				if (register.result?.success == false) {
					return;
				}

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
		<div>
			<div class="inputBox">
				<input type="text" name="username" required />
				<label for="username">Никнейм</label>
			</div>
			{#if register.result?.error.username}
				<span class="errorMessage"
					>{register.result?.error.username[0]}</span
				>
			{/if}
		</div>

		<div>
			<div class="inputBox">
				<input type="email" name="email" required />
				<label for="email">Почта</label>
			</div>
			{#if register.result?.error.email}
				<span class="errorMessage"
					>{register.result?.error.email[0]}</span
				>
			{/if}
		</div>

		<div>
			<div class="inputBox">
				<input type="password" name="password" required />
				<label for="password">Пароль</label>
			</div>
			<div class="inputBox pt-2">
				<input type="password" name="password2" required />
				<label for="password2">Повторить пароль</label>
			</div>
			{#if register.result?.error.password}
				<span class="errorMessage"
					>{register.result?.error.password[0]}</span
				>
			{/if}
			{#if register.result?.error.password2}
				<span class="errorMessage"
					>{register.result?.error.password2[0]}</span
				>
			{/if}
		</div>

		<div class="flex justify-between">
			<span></span><a class="text-accent" href="/login">Вход</a>
		</div>

		<button type="submit">
			{#if register.pending > 0}
				<span class="relative">
					Зарегистрироватся
					<img
						class="absolute left-full top-0 mx-2 h-full"
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
