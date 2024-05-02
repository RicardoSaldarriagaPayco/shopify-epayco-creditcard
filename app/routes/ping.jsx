import { json } from "@remix-run/node";
import { login } from "../shopify.server";


export const loader = async ({ request }) => {
  return json({ ePayco: "success" });
};

