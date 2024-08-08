import { json } from "@remix-run/node";
import PaymentsAppsClient, { PAYMENT } from "~/payments-apps.graphql";
import { getPaymentSession, getRejectReason, rejectReasons } from "~/payments.repository";
import { sessionStorage } from "../shopify.server";

/**
 * Confirms a session.
 */
export const action = async ({ request }) => {
  console.log(`[confirm_session]`);
  const requestBody = await request.json();
  console.log(`[requestBody]: ${JSON.stringify(requestBody)}`);
  const paymentSession = await getPaymentSession(requestBody.id);
  console.log(`[paymentSession]: ${JSON.stringify(paymentSession)}`);
  const lastName = JSON.parse(paymentSession.customer).billing_address.family_name
  const status = paymentSession.status;
  const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
  const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);

  let response;
  const isReject = (status === 'reject') ? true : false;
  console.log(`[isReject]: ${status}`);
  // Last name can be used to simulate a rejection
  if (isReject ) {
    response = await client.rejectSession(paymentSession, { reasonCode: getRejectReason("PROCESSING_ERROR") });
    return json({ errors: [`Transaccion rechazada. Error code: ${isReject}`] }, { status: response.status });
  }

  response = await client.resolveSession(paymentSession);
  const userErrors = response.userErrors;
  if (userErrors?.length > 0) return json({ errors: userErrors }, { status: response.status });

  return json({}, { status: 200 });
}
