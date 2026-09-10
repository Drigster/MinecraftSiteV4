<script lang="ts">
	import { loginSchema } from "$lib/schemas";
	import { login } from "$lib/auth.remote";
	import SubmitButton from "$lib/components/SubmitButton.svelte";
	import { resolve } from "$app/paths";
	import InputBox from "$lib/components/InputBox.svelte";
</script>

<svelte:head>
	<title>Вход | Foxy.town</title>
</svelte:head>

<div class="bg-blur m-auto min-w-96 rounded-lg bg-background/60 p-10">
	<h2
		class="mx-auto mb-8 text-center text-3xl font-bold uppercase text-accent"
	>
		Вход
	</h2>
	<form
		class="flex flex-col"
		{...login.preflight(loginSchema).enhance(async (form) => {
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
			id="login"
			title="Логин"
			field={login.fields.login}
			autocomplete="username"
		/>
		<InputBox
			id="password"
			title="Пароль"
			field={login.fields._password}
			autocomplete="current-password"
			isPassword={true}
		/>

		<div class="-mt-2 mb-3 flex justify-between">
			<a
				class="text-accent hover:text-accent/60"
				href={resolve("/forgotPassword")}
			>
				<button>Забыл пароль</button>
			</a>
			<a
				class="text-accent hover:text-accent/60"
				href={resolve("/register")}
			>
				<button>Регистрация</button>
			</a>
		</div>

		<SubmitButton disabled={login.pending > 0} loading={login.pending > 0}>
			Войти
		</SubmitButton>
	</form>
</div>
