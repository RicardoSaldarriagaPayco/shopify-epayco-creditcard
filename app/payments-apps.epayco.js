const CryptoJS = require('crypto-js');

/**
 * Client to interface with the Payments Apps Epayco API.
 *
 * paymentsAppConfigure: Configure the payments app with the provided variables.
 * paymentSessionResolve: Resolves the given payment session.
 * paymentSessionReject: Rejects the given payment session.
 * refundSessionResolve: Resolves the given refund session.
 * refundSessionReject: Rejects the given refund session.
 */
export default class PaymentsAppsEpayco {
    BASE_URL_APIFY = process.env.BASE_URL_APIFY ? process.env.BASE_URL_APIFY :"https://apify.epayco.io";
    constructor(options) {
        this.publicKey = options.publicKey;
        this.privateKey = options.privateKey;
        this.lang = options.lang;
        this.test = options.test ? 'TRUE' : 'FALSE';
        const encoded = CryptoJS.enc.Utf8.parse(`${this.publicKey}:${this.privateKey}`); 
        const token = CryptoJS.enc.Base64.stringify(encoded);
        this.accessToken = `Basic ${token}`;
      }


      /**
     * Generic sessionToken resolution function
     * @returns the response body from the ePayco API
     */
    async sessionToken() {
        const response = await this.#perform([], 'login');
        return response;
    }

    /**
     * Generic session resolution function
     * @param {*} session the session to resolve upon
     * @param {*} paymentSession the paymentSession to resolve payment
     * @returns the response body from the ePayco API
     */
    async charge(session, paymentSession) {
        const { id, gid, kind } = session;
        const { billing_address: billingAddress,
            shipping_address: shippingAddress
          } = paymentSession.customer;
          const email = paymentSession.customer.email;
          const name = billingAddress.given_name || shippingAddress.given_name;
          const last_name = (billingAddress.family_name || shippingAddress.family_name).toUpperCase();
          const country_code = billingAddress.country_code || shippingAddress.country_code;
          const city = billingAddress.city || shippingAddress.city;
          const address = billingAddress.line1 || shippingAddress.line1;
          const phone = billingAddress.phone_number || shippingAddress.phone_number;
          const bill = paymentSession.id;
          const value = paymentSession.amount;
          const currency = paymentSession.currency;
          const payload = { 
            id,
            email,
            name,
            last_name,
            country_code,
            city,
            address,
            phone,
            bill,
            value,
            currency
        };
        const response = await this.#perform(payload, '/payment/process');
        return response;
    }

    /**
   * Client perform function. Calls ePayco API.
   * @param {*} query the query to run
   * @param {*} path 
   * @returns
   */
    async #perform(query, path) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': this.accessToken
          }
    
        const response = await fetch(this.BASE_URL_APIFY+`/${path}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query
          })
        })
        console.log(`[apify] Making request for path: "${path}"`)
    
        const responseBody = await response.json();
        console.log(`[apify] response: ${JSON.stringify(responseBody)}`);
    
        return response.ok ? responseBody.data : null
      }

}