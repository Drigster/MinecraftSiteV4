<script lang="ts">
	import { onDestroy, onMount, tick } from "svelte";
	import hljs from "highlight.js";
	import "highlight.js/styles/tokyo-night-dark.css";
	import log4j from "./log4j";
	import { ArrowRight, Loader } from "@o7/icon/lucide";

	type WebSocketMessage = {
		type: "ack" | "error" | "update" | "full";
		message: string;
	};

	type Status = "disconnected" | "connected" | "awaitingResponce";

	hljs.registerLanguage("log4j", log4j);

	let data = $state("");
	let status: Status = $state("disconnected");
	let pastCommands: string[] = $state([]);

	let codeElement = $state<HTMLElement>();
	let formElement = $state<HTMLFormElement>();

	let socket: WebSocket;

	onMount(async () => {
		socket = new WebSocket("ws://localhost:8080");

		socket.onopen = () => {
			status = "connected";
			socket.send(JSON.stringify({ type: "full" }));
		};

		socket.onmessage = async (event: MessageEvent) => {
			try {
				const response: WebSocketMessage = JSON.parse(event.data);

				switch (response.type) {
					case "ack":
						formElement?.reset();
						status = "connected";
						break;

					case "error":
						console.error("❌ Error:", response.message);
						break;

					case "update":
						data +=
							"\n" +
							hljs.highlight(response.message, {
								language: "log4j",
							}).value;
						await tick(); // Wait for the DOM to update
						codeElement?.scrollTo({
							top: codeElement.scrollHeight,
							behavior: "smooth",
						});
						status = "connected";
						break;

					case "full":
						data = hljs.highlight(response.message, {
							language: "log4j",
						}).value;
						await tick(); // Wait for the DOM to update
						codeElement?.scrollTo({
							top: codeElement.scrollHeight,
							behavior: "instant",
						});
						status = "connected";
						break;

					default:
						console.warn("⚠️ Unknown message type:", response);
				}
			} catch (error) {
				console.error("Failed to parse WebSocket message:", error);
				console.log("Raw message:", event.data);
			}
		};

		socket.onclose = () => {
			status = "disconnected";
			console.log("WebSocket disconnected");
		};

		socket.onerror = (error: Event) => {
			console.error("WebSocket error:", error);
		};

		let store = localStorage.getItem("pastCommands");

		if (store != null) {
			let json = JSON.parse(store);
			if (json) {
				pastCommands = json;
			}
			console.log(pastCommands);
		}
	});

	onDestroy(() => {
		if (socket) {
			socket.close();
		}
	});

	$effect(() => {
		localStorage.setItem("pastCommands", JSON.stringify(pastCommands));
	});

	function handleSublit(
		e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
	) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		if (formData.has("command")) {
			let command = formData.get("command") as string;
			if (command.trim() != "") {
				sendCommand(command);
				pastCommands.push(command);
			}
		}
	}

	function sendCommand(command: string) {
		socket.send(JSON.stringify({ type: "command", message: command }));
		status = "awaitingResponce";
	}
</script>

<div class="flex flex-col">
	<div class="bg-slate-700 rounded-t-lg grid relative">
		{#if status == "disconnected"}
			<div
				class="grid place-content-center absolute inset-0 z-50 bg-black bg-opacity-75 text-xl"
			>
				Loading...
			</div>
		{/if}
		<pre class="overflow-auto m-0 text-xs"><code
				class="log4j grid-area-1-1 h-[65vh] block overflow-x-auto p-2"
				bind:this={codeElement}>{@html data}</code
			></pre>
	</div>
	<form
		class="bg-slate-900 rounded-b-lg relative flex"
		action=""
		onsubmit={handleSublit}
		bind:this={formElement}
	>
		<span class="absolute left-0 top-0 p-2">$</span>
		<input
			name="command"
			disabled={status == "awaitingResponce"}
			class="p-2 w-full bg-transparent pl-6 rounded-bl-lg"
		/>
		<button
			type="submit"
			class="aspect-square bg-slate-950 flex justify-center items-center rounded-br-lg border"
		>
			{#if status == "awaitingResponce"}
				<Loader class="animate-spin" />
			{:else}
				<ArrowRight />
			{/if}
		</button>
	</form>
</div>
<div class="grid gap-2 mt-2">
	{#each pastCommands as command}
		<div
			class="flex items-center justify-between bg-slate-800 p-2 rounded-lg"
		>
			<span class="truncate mr-2">{command}</span>
			<button
				class="p-2 flex-shrink-0"
				onclick={() => sendCommand(command)}>Send</button
			>
		</div>
	{/each}
</div>

<style>
	.grid-area-1-1 {
		grid-area: 1 / 1;
	}

	:global {
		/* Minecraft Color Codes CSS */
		.hljs-color-code {
			display: none;
		}
		.hljs-mc-black {
			color: #000000;
		}
		.hljs-mc-black::before {
			content: "";
		}
		.hljs-mc-black {
			text-indent: -2ch;
			padding-left: 2ch;
		}

		.hljs-mc-dark-blue {
			color: #0000aa;
		}
		.hljs-mc-dark-green {
			color: #00aa00;
		}
		.hljs-mc-dark-aqua {
			color: #00aaaa;
		}
		.hljs-mc-dark-red {
			color: #aa0000;
		}
		.hljs-mc-dark-purple {
			color: #aa00aa;
		}
		.hljs-mc-gold {
			color: #ffaa00;
		}
		.hljs-mc-gray {
			color: #aaaaaa;
		}
		.hljs-mc-dark-gray {
			color: #555555;
		}
		.hljs-mc-blue {
			color: #5555ff;
		}
		.hljs-mc-green {
			color: #55ff55;
		}
		.hljs-mc-aqua {
			color: #55ffff;
		}
		.hljs-mc-red {
			color: #ff5555;
		}
		.hljs-mc-light-purple {
			color: #ff55ff;
		}
		.hljs-mc-yellow {
			color: #ffff55;
		}
		.hljs-mc-white {
			color: #ffffff;
		}

		/* Hex colors */
		.hljs-mc-hex {
			background: linear-gradient(
				45deg,
				#ff0000,
				#ff7f00,
				#ffff00,
				#00ff00,
				#0000ff,
				#4b0082,
				#9400d3
			);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		/* Formatting codes */
		.hljs-mc-bold {
			font-weight: bold;
		}
		.hljs-mc-strikethrough {
			text-decoration: line-through;
		}
		.hljs-mc-underline {
			text-decoration: underline;
		}
		.hljs-mc-italic {
			font-style: italic;
		}

		/* Hide § symbols using a more reliable method */
		.hljs-minecraft-text [class^="hljs-mc-"] {
			position: relative;
		}

		.hljs-minecraft-text [class^="hljs-mc-"]::first-letter {
			visibility: hidden;
			width: 0;
			display: inline-block;
		}

		/* Alternative approach - replace § with empty content */
		.hljs-minecraft-text [class^="hljs-mc-"] {
			font-size: 0;
		}

		.hljs-minecraft-text [class^="hljs-mc-"]::after {
			content: attr(data-text);
			font-size: 1rem;
		}

		.hljs-trace {
			color: #5a8dab; /* Muted blue for TRACE */
			font-weight: normal;
		}

		.hljs-debug {
			color: #6ba6c9; /* Soft sky blue for DEBUG */
			font-weight: normal;
		}

		.hljs-info {
			color: #4c9a4c; /* Muted green for INFO */
			font-weight: normal;
		}

		.hljs-warn {
			color: #bfa45b; /* Muted amber for WARN */
			font-weight: normal;
		}

		.hljs-error {
			color: #bf6b5b; /* Muted red-orange for ERROR */
			font-weight: normal;
		}

		.hljs-fatal {
			color: #a84c4c; /* Muted red for FATAL */
			font-weight: normal;
		}
	}
</style>
