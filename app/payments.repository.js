import prisma from "~/db.server";

/**
 * Creates a PaymentSession entity with the provided data.
 */
export const createPaymentSession = async (paymentSession) => {
  const {id, amount, paymentMethod, customer, clientDetails, merchantLocale} = paymentSession;
  var sessionPayment = await prisma.shopify_tdc_paymentsession.findUnique({
    where: { id }
  })
  if(sessionPayment){
    return {
      ...paymentSession,
        amount: parseFloat(paymentSession.amount),
        paymentMethod: JSON.stringify(paymentSession.paymentMethod),
        customer: JSON.stringify(paymentSession.customer),
        clientDetails: JSON.stringify(paymentSession.clientDetails)
    };
  }else{
    return await prisma.shopify_tdc_paymentsession.create({
      data: {
        ...paymentSession,
        amount: parseFloat(amount),
        paymentMethod: JSON.stringify(paymentMethod),
        customer: JSON.stringify(customer),
        clientDetails: JSON.stringify(clientDetails)
      }
    });
  }
}

/**
 * Updates the given PaymentSession's status.
 */
export const updatePaymentSessionStatus = async (id, status) => {
  if (!validateStatus(status)) return;
  return await prisma.shopify_tdc_paymentsession.update({
    where: { id },
    data: { status: status }
  })
}

/**
 * Updates the given PaymentSession's authenticationData.
 * @param { {authenticationFlow: string, chargebackLiability: string, transStatus: string, version: string } | { partnerError: string } } authenticationData 
 * @returns 
 */
export const updatePaymentSessionAuthData = async (id, authenticationData) => {
  return await prisma.shopify_tdc_paymentsession.update({
    where: { id },
    data: { threeDSecureAuthentication: JSON.stringify(authenticationData) }
  })
}


/**
 * Returns the PaymentSession entity with the provided paymentId.
 */
export const getPaymentSession = async (id) => {
  return await prisma.shopify_tdc_paymentsession.findUniqueOrThrow({
    where: { id },
    include: { refunds: true, captures: true, void: true }
  })
}

/**
 * Fetches the 25 latest payment sessions along with their relations.
 */
export const getPaymentSessions = async () => {
  return await prisma.shopify_tdc_paymentsession.findMany({
    take: 25,
    include: { refunds: true, captures: true, void: true },
    orderBy: { proposedAt: 'desc' }
  })
}

/**
 * Creates a RefundSession entity with the provided data.
 */
export const createRefundSession = async (refundSession) => {
  const {amount} = refundSession;
  return await prisma.shopify_tdc_refundsession.create({
    data: {
      ...refundSession,
      amount: parseFloat(amount)
    }
  });
}

/**
 * Updates the given RefundSession's status.
 */
export const updateRefundSessionStatus = async (id, status) => {
  if (!validateStatus(status)) return;
  return await prisma.shopify_tdc_refundsession.update({
    where: { id },
    data: { status: status }
  })
}

/**
 * Creates a CaptureSession entity with the provided data.
 */
export const createCaptureSession = async (captureSession) => {
  const {amount} = captureSession;
  return await prisma.shopify_tdc_capturesession.create({
    data: {
      ...captureSession,
      amount: parseFloat(amount)
    }
  });
}

/**
 * Updates the given CaptureSession's status
 */
export const updateCaptureSessionStatus = async (id, status) => {
  if (!validateStatus(status)) return;
  return await prisma.shopify_tdc_capturesession.update({
    where: { id },
    data: { status: status }
  })
}

/**
 * Creates a VoidSession entity with the provided data.
 */
export const createVoidSession = async (voidSession) => {
  return await prisma.shopify_tdc_voidsession.create({ data: voidSession });
}

/**
 * Updates the given VoidSession's status
 */
export const updateVoidSessionStatus = async (id, status) => {
  if (!validateStatus(status)) return;
  return await prisma.shopify_tdc_voidsession.update({
    where: { id },
    data: { status: status }
  })
}

/**
 * Returns the configuration for the provided session.
 */
export const getConfiguration = async (sessionId) => {
  const configuration = await prisma.shopify_tdc_configurationshopify.findUnique({ where: { sessionId }});
  return configuration;
}

/**
 * Returns the configuration for the payment session.
 */
export const getCredentials = async (shop) => {
  const configuration = await prisma.shopify_tdc_configurationshopify.findFirst({ where: { shop }});
  return configuration;
}

/**
 * Returns the configuration for the session if it exists, create it otherwise.
 */
export const getOrCreateConfiguration = async (sessionId, config) => {
  const configuration = await prisma.shopify_tdc_configurationshopify.upsert({
    where: { sessionId },
    update: { ...config },
    create: { sessionId, ...config },
  })
  return configuration;
}

export const RESOLVE = "resolve"
export const REJECT = "reject"
export const PENDING = "pending"

const validateStatus = (status) => [RESOLVE, REJECT, PENDING].includes(status);

export const rejectReasons = [
  "PROCESSING_ERROR",
  "RISKY",
  "AUTHENTICATION_FAILED",
  "INCORRECT_NUMBER",
  "INCORRECT_CVC",
  "INCORRECT_ZIP",
  "INCORRECT_ADDRESS",
  "INCORRECT_PIN",
  "INVALID_NUMBER",
  "INVALID_CVC",
  "INVALID_EXPIRY_DATE",
  "EXPIRED_CARD",
  "CARD_DECLINED",
  "CONFIRMATION_REJECTED",
]

export const getRejectReason = (lastName) => (
  rejectReasons.includes(lastName) ? lastName : "PROCESSING_ERROR"
)
