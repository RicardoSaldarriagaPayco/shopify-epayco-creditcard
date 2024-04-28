import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  BlockStack,
  Card,
  Button,
  Banner,
  FormLayout,
  TextField,
  Checkbox,
  Select,
  Spinner,
  FooterHelp,
  Link,
} from "@shopify/polaris";

import { authenticate } from "~/shopify.server";
import { getConfiguration, getOrCreateConfiguration } from "~/payments.repository";
import PaymentsAppsClient from "~/payments-apps.graphql";
/**
 * Loads the app's configuration if it exists.
*/
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const apiKey = process.env.SHOPIFY_API_KEY;

  const config = await getConfiguration(session.id);

  return json({ shopDomain: session.shop, apiKey: apiKey, config: config });
};

/**
 * Saves the app's configuration.
 */
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();
  const config = {
    shop: session.shop,
    pCustId: formData.get("pCustId"),
    publicKey: formData.get("publicKey"),
    privateKey: formData.get("privateKey"),
    pKey: formData.get("pKey"),
    ready: true,
    apiVersion: '2024-07',
  };
  const configuration = await getOrCreateConfiguration(session.id, config);

  const client = new PaymentsAppsClient(session.shop, session.accessToken);
  const response = await client.paymentsAppConfigure('epayco-credit-card', true);

  const userErrors = response.userErrors || [];

  if (userErrors.length > 0) return json({ errors: userErrors });
  return json({ raiseBanner: true, errors: userErrors });
}

export default function Index() {
  const nav = useNavigation();
  const { shopDomain, apiKey, config } = useLoaderData();
  const action = useActionData();

  const [pCustId, setPCustId] = useState(config ? config.pCustId : '');
  const [publicKey, setPublicKey] = useState(config ? config.publicKey : '');
  const [privateKey, setPrivateKey] = useState(config ? config.privateKey : '');
  const [pKey, setPKey] = useState(config ? config.pKey : '');
  const [ready, setReady] = useState(config ? config.ready : false);
  const [apiVersion, setApiVersion] = useState(config ? config.apiVersion : 'unstable');
  const [showBanner, setShowBanner] = useState(action ? action.raiseBanner : false);
  const [errors, setErrors] = useState([]);

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  useEffect(() => {
    if (action?.raiseBanner) setShowBanner(true);
    if (action?.errors.length > 0) setErrors(action.errors);
  }, [action]);

  const errorBanner = () => (
    errors.length > 0 && (
      <Banner
        title={'An error ocurred!'}
        status="critical"
        onDismiss={() => { setErrors([]) }}
      >
        {
          errors.map(({message}, idx) => (
            <Text as="p" key={idx}>{message}</Text>
          ))
        }
      </Banner>
    )
  )

  const banner = () => (
    showBanner && (
      <Banner
        title={'Settings updated!'}
        action={{
          content: 'Return to Shopify',
          url: `https://${shopDomain}/services/payments_partners/gateways/${apiKey}/settings`,
        }}
        status="success"
        onDismiss={() => { setShowBanner(false) }}
      />)
    );


  if (isLoading) {
    return (
      <Page fullWidth >
        <div style={{display: "flex", height: "100vh", alignItems: "center", justifyContent: "center"}}>
          <Spinner accessibilityLabel="Spinner" size="large" />
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <BlockStack gap="5">
        <Layout>
          <Layout.Section>
            <BlockStack gap="4">
              {banner()}
              {errorBanner()}
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap="5">
                <BlockStack gap="2">
                  <Text as="h2" variant="headingMd">
                    ePayco
                  </Text>
                  <Text as="p">
                    Instructivo de implementación:
                    <ol>
                      <li>Crear una cuenta <a href="https://dashboard.epayco.com/register">ePayco</a></li>
                      <li>Iniciar sesión en tu cuenta <a href="https://dashboard.epayco.com/login">ePayco</a></li>
                      <li>Haz clic en el módulo "Integraciones" y en el submódulo de "Llaves API" se encontrarán las llaves secretas (credenciales de seguridad proporcionadas por ePayco)</li>
                    </ol>
                  </Text>
                  <Text as="p">
                    Obtén ayuda de ePayco
                  </Text>
                </BlockStack>
                <BlockStack gap="2">
                  <Card>
                    <Form method="post">
                      <FormLayout>
                        <TextField
                          label="ID DE COMERCIO"
                          name="pCustId"
                          onChange={(change) => setPCustId(change)}
                          value={pCustId}
                          autoComplete="off"
                        />
                        <TextField
                          label="PUBLIC KEY"
                          name="publicKey"
                          onChange={(change) => setPublicKey(change)}
                          value={publicKey}
                          autoComplete="off"
                        />
                        <TextField
                          label="PRIVATE KEY"
                          name="privateKey"
                          onChange={(change) => setPrivateKey(change)}
                          value={privateKey}
                          autoComplete="off"
                        />
                        <TextField
                          label="P KEY"
                          name="pKey"
                          onChange={(change) => setPKey(change)}
                          value={pKey}
                          autoComplete="off"
                        />
                        <Button submit>Submit</Button>
                      </FormLayout>
                    </Form>
                  </Card>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <FooterHelp>
          <Text as="span">aprende más sobre </Text>
          <Link url="https://epayco.com/" target="_blank">
            ePayco
          </Link>
        </FooterHelp>
      </BlockStack>
    </Page>
  );
}
