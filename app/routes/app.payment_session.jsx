import { createPaymentSession, getRejectReason , getCredentials} from "~/payments.repository";
import { sessionStorage } from "~/shopify.server";
import PaymentsAppsClient, { PAYMENT } from "~/payments-apps.graphql";
import { json } from "@remix-run/node";
import decryptCreditCardPayload from "~/encryption";
import { epaycoConfig, processEpaycoPaymentCreditCard } from "~/epaycoConfig";
import PaymentsAppsEpayco from "~/payments-apps.epayco";

/**
 * Saves and starts a payment session.
 * Returns an empty response and process the payment asyncronously
 */
export const action = async ({ request }) => {
  const requestBody = await request.json();

  const shopDomain = request.headers.get("shopify-shop-domain") ?? request.headers.get("Shopify-shop-domain");

  const sessionPayload = createParams(requestBody, shopDomain);
  const paymentSession = await createPaymentSession(sessionPayload);

  if (!paymentSession) throw new Response("A PaymentSession couldn't be created.", { status: 500 });

  // Once the private key is set in encryption.js, this can be used for processing.
  const creditCard = decryptCard(sessionPayload.paymentMethod.data);

  // Process the payment asyncronously
  setTimeout((async () => { processPayment(paymentSession,creditCard) }), 0);

  // Return empty response, 201
  return json({}, { status: 201 });
  
}

const createParams = ({id, gid, group, amount, currency, test, kind, customer, payment_method, proposed_at, cancel_url, client_details, merchant_locale}, shopDomain) => (
  {
    id,
    gid,
    group,
    amount,
    currency,
    test,
    kind,
    customer,
    paymentMethod: payment_method,
    proposedAt: proposed_at,
    cancelUrl: cancel_url,
    shop: shopDomain,
    clientDetails: client_details,
    merchantLocale: merchant_locale,
  }
)

const processPayment = async (paymentSession,creditCard) => {
  const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
  const config = await getCredentials(session.shop);
  const pCustId = config?.pCustId;
  const publicKey = config?.publicKey;
  const privateKey = config?.privateKey;
  const test = paymentSession.test;
  const lang = paymentSession.merchantLocale.substr(0, 2).toUpperCase();
  const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);
  //const epayco = await epaycoConfig(publicKey,privateKey,lang,test);
  const epayco = new PaymentsAppsEpayco({publicKey: publicKey,privateKey: privateKey, lang: lang, test: test});
  const {token} = await epayco.sessionToken();
  epayco.accessToken= `Bearer ${token}`;
  const {success, data} = await epayco.charge(paymentSession,creditCard);
  if(!success){
      return;
  }
  const {estado} = data.transaction.data;
  //const estado = await processEpaycoPaymentCreditCard(epayco, client, paymentSession);

  if (estado === "Rechazada") {
    await client.rejectSession(paymentSession, { reasonCode: getRejectReason("PROCESSING_ERROR") });
  } else if (estado === "Aceptada") {
    await client.resolveSession(paymentSession);
  } else {
    await client.pendSession(paymentSession);
  }
}

const decryptCard = ({encrypted_message, ephemeral_public_key, tag}) => {
  return decryptCreditCardPayload({
    encryptedMessage: encrypted_message,
    ephemeralPublicKey: ephemeral_public_key.replace(/\n$/, ""),
    tag
  })
}
