import axios from "axios";
import { AppError } from "../../common/errors/AppError"; 
import { User } from "../auth/user.model";
import { StatusCodes } from "http-status-codes";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_URL } = process.env;

export class PaymentService {
  // 1. Get Access Token (OAuth 2.0)
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
    ).toString("base64");
    try {
      const response = await axios.post(
        `${PAYPAL_API_URL}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      throw new AppError("PayPal Auth Failed", StatusCodes.SERVICE_UNAVAILABLE);
    }
  }

  // 2. Create Order
  async createOrder(amount: string = "10.00") {
    const accessToken = await this.getAccessToken();
    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return response.data; // Returns order ID to frontend
  }

  // 3. Capture Payment & Upgrade User
  async captureOrder(orderId: string, userId: string) {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (response.data.status === "COMPLETED") {
        // PAYMENT SUCCESS: Upgrade the user
        await User.findByIdAndUpdate(userId, { isPro: true });
        return { success: true, status: "COMPLETED" };
      }

      return { success: false, status: response.data.status };
    } catch (error) {
      throw new AppError("Payment Capture Failed", StatusCodes.BAD_REQUEST);
    }
  }
}

export const paymentService = new PaymentService();
