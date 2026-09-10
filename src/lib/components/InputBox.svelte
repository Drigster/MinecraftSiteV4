<script lang="ts">
	import type { RemoteFormField } from "@sveltejs/kit";
	import type { FormEventHandler, FullAutoFill } from "svelte/elements";

	let {
		id,
		class: customClass,
		title,
		field,
		isPassword,
		autocomplete,
		inputClass,
		noIssues,
		pattern,
	}: {
		id: string;
		class?: string;
		title: string;
		field: RemoteFormField<string>;
		isPassword?: boolean;
		autocomplete?: FullAutoFill;
		inputClass?: string;
		noIssues?: boolean;
		pattern?: string;
	} = $props();

	let goodValue = $state("");
	let value = $state("");

	const oninput: FormEventHandler<HTMLInputElement> = (e) => {
		if (!pattern) return;
		let regex = new RegExp(pattern);
		let input = e.currentTarget.value as string;
		console.log(input);
		if (regex.test(input)) {
			goodValue = input;
			console.log("good");
			return;
		} else {
			input = input.substring(0, 6);
			console.log(input, " 2");
			if (regex.test(input)) {
				goodValue = input;
				value = input;
				console.log("good2");
				return;
			} else {
				console.log("bad", goodValue);
				value = goodValue;
			}
		}
	};
</script>

<div class={customClass}>
	<div class="inputBox">
		<input
			class={inputClass}
			{id}
			{...field.as(isPassword ? "password" : "text")}
			{autocomplete}
			required
			{oninput}
			bind:value
		/>
		<label for={id}>{title}</label>
	</div>
	{#if noIssues != true}
		<div class="min-h-6">
			{#each field.issues() as issue (issue.message + issue.path)}
				<span class="mx-2 text-sm text-red-500">{issue.message}</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.inputBox {
		position: relative;
	}

	.inputBox > input {
		padding-inline: 0.75rem;
		padding-top: 1.4rem;
		padding-bottom: 0.35rem;
		margin-inline: auto;
		background-color: hsl(var(--background));
		border-radius: 0.25rem;
		width: 100%;
	}

	.inputBox > label {
		position: absolute;
		left: 0;
		padding-left: 0.75rem;
		margin-block: 0.87rem;
		color: hsl(var(--text-muted));
		transition: 0.5s;
		pointer-events: none;
	}

	.inputBox input:valid ~ label,
	.inputBox input:focus ~ label {
		transform: translateY(-0.5rem);
		font-size: 0.8em;
	}
</style>
