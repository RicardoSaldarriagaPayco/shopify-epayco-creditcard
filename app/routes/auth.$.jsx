import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  console.log(`[app_auth_payment_session]`);
  await authenticate.admin(request);

  return null;
};
