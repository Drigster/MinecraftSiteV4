<script lang="ts">
	import { onDestroy, onMount, tick } from "svelte";
	import hljs from "highlight.js";
	import "highlight.js/styles/tokyo-night-dark.css";
	import log4j from "./log4j";
	import { ArrowRight, Loader } from "@o7/icon/lucide";
	import { sendCommand } from "./console.remote";
	import { page } from "$app/state";
	import { getFlash } from "sveltekit-flash-message";

	const flash = getFlash(page);

	type WebSocketMessage =
		| {
				type: "error" | "update" | "full";
				message: string;
		  }
		| {
				type: "ack";
		  };

	type Status =
		| "Disconnected"
		| "Connecting"
		| "Connected"
		| "Error"
		| "Reconnecting";

	const statusColor: {
		[K in Status]: string;
	} = {
		Disconnected: "red",
		Connecting: "yellow",
		Connected: "lightgreen",
		Error: "red",
		Reconnecting: "yellow",
	};

	hljs.registerLanguage("log4j", log4j);

	let { data: pageData } = $props();

	let data = $state(pageData.log);
	let status: Status = $state("Disconnected");
	let pastCommands: string[] = $state([]);
	let wsTimeout = $state(0);
	let wsMaxTimeout = 60;

	let codeElement = $state<HTMLElement>();

	let socket: WebSocket;

	onMount(async () => {
		status = "Connecting";
		openSocket();

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

	$effect(() => {
		if (status == "Disconnected") {
			console.log("Reconnect effect");
			reconnectSocket();
		}
	});

	function reconnectSocket() {
		console.log("Status: " + status);
		status = "Reconnecting";
		console.log("Reconnecting");
		if (wsTimeout == 0) {
			console.log("Reconnecting instant");
			openSocket();
			wsTimeout = 5;
			return;
		}
		setTimeout(() => {
			console.log("Reconnecting " + wsTimeout);
			openSocket();
			console.log("wsTimeout = " + Math.min(wsTimeout * 2, wsMaxTimeout));
			wsTimeout = Math.min(wsTimeout * 2, wsMaxTimeout);
		}, wsTimeout);
	}

	function openSocket() {
		socket = new WebSocket("ws://localhost:3000/ws");
		console.log("Connecting to WebSocket...");

		socket.onopen = () => {
			wsTimeout = 0;
			status = "Connected";
			console.log("Connected");
		};

		socket.onmessage = async (event: MessageEvent) => {
			try {
				const response: WebSocketMessage = JSON.parse(event.data);

				switch (response.type) {
					case "ack":
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
						await tick();
						codeElement?.scrollTo({
							top: codeElement.scrollHeight,
							behavior: "smooth",
						});
						break;

					case "full":
						data = hljs.highlight(response.message, {
							language: "log4j",
						}).value;
						await tick();
						codeElement?.scrollTo({
							top: codeElement.scrollHeight,
							behavior: "instant",
						});
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
			status = "Disconnected";
			console.log("Disconnected");
		};

		socket.onerror = (error: Event) => {
			status = "Error";
			console.log("Error:", error);
		};
	}
</script>

<div class="flex flex-col">
	<div class="relative grid rounded-t-lg bg-slate-700">
		<div
			class="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-gray-500 px-2 py-1 text-center"
			style="color: {statusColor[status]};"
		>
			{status}
		</div>
		<pre class="m-0 overflow-auto text-xs"><code
				class="log4j grid-area-1-1 block h-[65vh] overflow-x-auto p-2"
				bind:this={codeElement}>{@html data}</code
			></pre>
	</div>
	<form
		class="relative flex rounded-b-lg bg-slate-900"
		{...sendCommand.enhance(async ({ form, data, submit }) => {
			try {
				await submit();
				let command = data.get("command")?.toString();
				if (command) {
					let len = pastCommands.unshift(command);
					if (len > 6) {
						pastCommands.pop();
					}
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
		<span class="absolute left-0 top-0 p-2">$</span>
		<input
			name="command"
			disabled={sendCommand.pending > 0}
			class="w-full rounded-bl-lg bg-transparent p-2 pl-6"
		/>
		<button
			type="submit"
			class="flex aspect-square items-center justify-center rounded-br-lg border bg-slate-950"
		>
			{#if sendCommand.pending > 0}
				<Loader class="animate-spin" />
			{:else}
				<ArrowRight />
			{/if}
		</button>
	</form>
</div>
<div class="mt-2 grid gap-2">
	{#each pastCommands as command (command)}
		<div
			class="flex items-center justify-between rounded-lg bg-slate-800 p-2"
		>
			<span class="mr-2 truncate">{command}</span>
			<form
				{...sendCommand.enhance(async ({ submit }) => {
					try {
						await submit();
					} catch (error) {
						$flash = {
							type: "success",
							message: "Ошибка, попробуйте позже",
						};
						console.log(error);
					}
				})}
			>
				<input type="text" name="command" value={command} hidden />
				<button class="flex-shrink-0 p-2" type="submit">Send</button>
			</form>
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
