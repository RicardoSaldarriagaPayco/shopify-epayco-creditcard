import {
    Button,
    Card,
    FooterHelp,
    FormLayout,
    Layout,
    Page,
    Text,
    TextField,
    BlockStack,
    Link,
    Banner,
    Select,
    LegacyStack,
    ChoiceList,
  } from "@shopify/polaris";
  import { useCallback, useEffect, useState } from "react";
  import {
    Form,
    useActionData,
  } from "@remix-run/react";
  import { json, redirect } from "@remix-run/node";
  
  import { sessionStorage } from "../shopify.server";
  import { getPaymentSession, updatePaymentSessionAuthData, rejectReasons, getRejectReason } from "~/payments.repository";
  import PaymentsAppsClient, { PAYMENT } from "~/payments-apps.graphql";
  import ThreeDSecure from "~/three-d-s.constants";
  /**
   * Loads the payment session for 3DS.
   */
  export const loader = async ({request, params: { paymentId } }) => {
    const paymentSession = await getPaymentSession(paymentId);

    return json({ paymentSession });
  }
  
 
  export const action = async ({ request, params: { paymentId } }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const status = data["x_response"];
    const paymentSession = await getPaymentSession(paymentId);
    const isReject = (status === 'Rechazada' || status === 'Cancelada' || status === 'abandonada' || status === 'Fallida') ? true : false;
  
    const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
    const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);

    //setTimeout((async () => {await processPayment(paymentSession,client,isReject,status) }), 0);
    await processPayment(paymentSession,client,isReject,status);
    return json({}, { status: 200 });
  }

  const processPayment = async (paymentSession,client,isReject,status) => {
    if (isReject) {
      await client.rejectSession(paymentSession, { reasonCode: getRejectReason("PROCESSING_ERROR") });
    } 
    else if (status === "Aceptada") {
      await client.resolveSession(paymentSession);
    }
  }
  
 