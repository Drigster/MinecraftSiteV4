import { redirect } from "@sveltejs/kit";

export const load = async ({ url, locals }) => {
	if (locals.user!.verified) {
		const redirectTo = url.searchParams.get("redirectTo");
		if (redirectTo != null) {
			return redirect(303, redirectTo);
		}
	}
};
