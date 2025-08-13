import { db } from "$lib/db";
import { generateIdFromEntropySize } from "lucia";
import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";
import { v4 as uuidv4 } from "uuid";
import { getServers } from "$lib/util.server";

const serverCreateSchema = z.object({
	serverName: z.string().min(1, "Название не может быть пустым"),
	description: z.string(),
	ip: z.string().min(1, "IP не может быть пустым"),
	port: z.number().optional(),
});

export const load = async () => {
	const serverCreateForm = await superValidate(zod(serverCreateSchema), {
		id: "serverCreateForm",
	});

	const servers = await getServers();

	const user_ids = servers.map((server) => server.ownerId);
	const users = await db
		.selectFrom("User")
		.selectAll()
		.where("id", "in", user_ids)
		.execute();

	const serversWithOwners = servers.map((server) => {
		const user = users.find((user) => user.id === server.ownerId);
		return { ...server, owner: user };
	});

	return {
		serverCreateForm,
		servers: serversWithOwners,
	};
};

export const actions = {
	createServer: async ({ request, locals }) => {
		const form = await superValidate(request, zod(serverCreateSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const _server = await db
			.insertInto("Server")
			.values({
				id: generateIdFromEntropySize(10),
				uuid: uuidv4(),
				name: form.data.serverName,
				description: form.data.description,
				ip: form.data.ip,
				port: form.data.port || 25565,
				ownerId: locals.user!.id,
				status: "HIDDEN",
				configHash: "",
			})
			.executeTakeFirstOrThrow();

		return message(form, {
			type: "info",
			text: "Сервер создан!",
		});
	},
};
