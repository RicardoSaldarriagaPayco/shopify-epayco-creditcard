import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  console.log(`[app_init_payment_session]`);
  await authenticate.admin(request);

  return null;
};
