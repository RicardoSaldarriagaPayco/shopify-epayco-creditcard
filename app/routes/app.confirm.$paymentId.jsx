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
  import { getPaymentSession, updatePaymentSessionAuthData, rejectReasons } from "~/payments.repository";
  import PaymentsAppsClient, { PAYMENT } from "~/payments-apps.graphql";
  import ThreeDSecure from "~/three-d-s.constants";
  /**
   * Loads the payment session for 3DS.
   */
  export const loader = async ({request, params: { paymentId } }) => {
    const paymentSession = await getPaymentSession(paymentId);
  
    const url = new URL(request.url);
    const lastName = JSON.parse(paymentSession.customer).billing_address.family_name;
    const isRejectLastName = rejectReasons.includes(lastName);
  
    const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
    const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);
  
    return json({ paymentSession });
  }
  
  /**
   * Completes a 3DS session based on the simulator's form
   */
  export const action = async ({ request, params: { paymentId } }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const status = data["x_response"];
    const paymentSession = await getPaymentSession(paymentId);
    const lastName = JSON.parse(paymentSession.customer).billing_address.family_name;
    //const isRejectLastName = rejectReasons.includes(data["choice"]);
    const isRejectLastName = (status !== 'Aceptada' || status !== 'Pendiente') ? true : false;
  
    const session = (await sessionStorage.findSessionsByShop(paymentSession.shop))[0];
    const client = new PaymentsAppsClient(session.shop, session.accessToken, PAYMENT);
  
    const authenticationPayload = {};
    if (!isRejectLastName) {
      Object.assign(authenticationPayload, {
        authenticationFlow: data["flow"],
        transStatus: data["transStatus"],
        version: data["version"],
        chargebackLiability: data["chargebackLiability"]
      });
    } else {
      authenticationPayload['partnerError'] = "PROCESSING_ERROR";
    }
  
    const newPaymentSession = await updatePaymentSessionAuthData(paymentId, authenticationPayload);
    const response = await client.confirmSession(newPaymentSession);
  
    const userErrors = response.userErrors;
    if (userErrors?.length > 0) return json({ errors: userErrors });
  
    return redirect(response.paymentSession.nextAction.context.redirectUrl);
  }
  
 