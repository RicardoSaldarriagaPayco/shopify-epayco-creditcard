import { getRejectReason } from "~/payments.repository";
import { json, redirect } from "@remix-run/node";
import { isNull } from "util";
/**
 * starts a epayco session.
 * Returns an epayco object
 */
export const epaycoConfig = async (publicKey, privateKey, language, test) => {
    return require('epayco-sdk-node')({
        apiKey: publicKey,
        privateKey: privateKey,
        lang: language,
        test: test
    })
  }
  
  /**
   * Start epayco payment
   */
export const processEpaycoPaymentCreditCard = async (epayco, client, paymentSession) => {
    const transaction = await makeTransaction(epayco, paymentSession); 
    return transaction;
  }
 
  
const makeTransaction = async (epayco, paymentSession) => {
  const { billing_address: billingAddress,
    shipping_address: shippingAddress,
    email
  } = JSON.parse(paymentSession.data.customer);
  const name = billingAddress.given_name || shippingAddress.given_name;
  const last_name = (billingAddress.family_name || shippingAddress.family_name).toUpperCase();
  const country_code = billingAddress.country_code || shippingAddress.country_code;
  const city = billingAddress.city || shippingAddress.city;
  const address = billingAddress.line1 || shippingAddress.line1;
  const phone = billingAddress.phone_number || shippingAddress.phone_number;
  const bill = paymentSession.data.id;
  const value = paymentSession.data.amount;
  const currency = paymentSession.data.currency;
  const ip = await getIp();
  var credit_info = {
    "card[number]": "4575623182290326",
    "card[exp_year]": "2025",
    "card[exp_month]": "12",
    "card[cvc]": "334",
    "hasCvv": true
  }
    return await epayco.token.create(credit_info)
    .then(async function(token) {
        if(token.status){
          console.log("Token created!");
          const token_card = token.id;
          var customer_info = {
            token_card,
            name,
            last_name, 
            email,
            default: true,
            city,
            address,
            phone,
            cell_phone: phone
          }
          return await epayco.customers.create(customer_info)
            .then(async function(customer) {
              if(customer.status){
                console.log("Customer Created!");
                const customer_id = customer.data.customerId;
                var payment_info = {
                  token_card,
                  customer_id,
                  doc_type: "CC",
                  doc_number: "10358519",
                  name,
                  last_name,
                  email,
                  city,
                  address,
                  phone,
                  cell_phone: phone,
                  bill,
                  description: "Shopiy payment",
                  value,
                  tax: "0",
                  tax_base: value,
                  currency,
                  dues: "1",
                  ip,
                  url_response: "https://ejemplo.com/respuesta.html",
                  url_confirmation: "https://ejemplo.com/confirmacion",
                  method_confirmation: "GET",
                  use_default_card_customer: true,
              }
              return await epayco.charge.create(payment_info)
                  .then(async function(charge) {
                      return charge.data.estado ?? 'Rechazada';
                  })
                  .catch(function(err) {
                      console.log("err: " + err);
                  });
              }else{
                console.log("Customer error!");
                return false;
              }
            })
            .catch(function(err) {
                console.log("err: " + err);
            });
        }else{
          console.log("Token error!");
          return false;
        }
    })
    .catch(function(err) {
        console.log("err: " + err);
    });
}

  /**
   * get customer ip.  
   * Returns a customer ip
   */
export const getIp = async () => {
    return await fetch('https://api.ipify.org/?format=json')
      .then(res => res.json())
      .then(data => data.ip);
  }