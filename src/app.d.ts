declare global {
	namespace App {
		// interface Platform {}
		interface Locals {
			user: import("lucia").User | null;
			session: import("lucia").Session | null;
		}
		// interface Error {}
		// interface Session {}
		// interface Stuff {}
		declare module "*?hex" {
			const content: string;
			export default content;
		}
		namespace Superforms {
			type Message = {
				type: "info" | "success" | "error";
				title?: string;
				text: string;
			};
		}
	}
}

export {};
