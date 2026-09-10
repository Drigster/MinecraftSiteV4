<script lang="ts">
	import { resolve } from "$app/paths";
	import { register } from "$lib/auth.remote";
	import InputBox from "$lib/components/InputBox.svelte";
	import SubmitButton from "$lib/components/SubmitButton.svelte";
	import { registerSchema } from "$lib/schemas";
</script>

<svelte:head>
	<title>Регистрация | Foxy.town</title>
</svelte:head>

<div class="bg-blur m-auto min-w-96 rounded-lg bg-background/60 p-10">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Регистрация
	</h2>

	<form
		class="flex flex-col"
		{...register.preflight(registerSchema).enhance(async (form) => {
			try {
				if (await form.submit()) {
					form.element.reset();
				}
			} catch (error) {
				console.log(error);
			}
		})}
	>
		<InputBox
			id="username"
			title="Никнейм"
			field={register.fields.username}
			autocomplete="username"
		/>
		<InputBox
			id="email"
			title="Почта"
			field={register.fields.email}
			autocomplete="email"
		/>
		<InputBox
			id="password"
			title="Пароль"
			field={register.fields._password}
			autocomplete="email"
			isPassword={true}
			noIssues={true}
		/>
		<InputBox
			id="password2"
			class="mt-2"
			title="Повторить пароль"
			field={register.fields._password2}
			autocomplete="email"
			isPassword={true}
			noIssues={true}
		/>
		<div class="min-h-6">
			{#each register.fields._password.issues() as issue (issue.message + issue.path)}
				<span class="absolute ml-2 text-sm text-red-500"
					>{issue.message}</span
				>
			{/each}
			{#each register.fields._password2.issues() as issue (issue.message + issue.path)}
				<span class="absolute ml-2 text-sm text-red-500"
					>{issue.message}</span
				>
			{/each}
		</div>

		<div class="-mt-2 mb-3 flex justify-center gap-2">
			<span>Уже есть аккаунт?</span>
			<a
				class="text-accent hover:text-accent/60"
				href={resolve("/login")}
			>
				<button>Войти</button>
			</a>
		</div>

		<SubmitButton
			disabled={register.pending > 0}
			loading={register.pending > 0}
		>
			Зарегистрироватся
		</SubmitButton>
	</form>
</div>
