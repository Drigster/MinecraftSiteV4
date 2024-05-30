<script>
	import { superForm } from "sveltekit-superforms";

	export let data;

	// Client API:
	const { form } = superForm(data.form);
</script>

<div class="grid items-center">
	<form method="POST">
		<label for="username">Username</label>
		<input type="text" name="username" bind:value={$form.username} />

		<label for="password">Password</label>
		<input type="password" name="password" bind:value={$form.password} />

		<div><button>Submit</button></div>
	</form>
</div>
