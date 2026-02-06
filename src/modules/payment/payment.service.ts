import axios from "axios";
import { AppError } from "../../common/errors/AppError";
import { User } from "../auth/user.model";
import { StatusCodes } from "http-status-codes";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_URL } = process.env;

export class PaymentService {
  // Helper: Get PayPal Access Token
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
      console.error("PayPal Auth Error:", error);
      throw new AppError(
        "Payment Provider Error",
        StatusCodes.SERVICE_UNAVAILABLE,
      );
    }
  }

  // 1. Create Order
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

    return { id: response.data.id, status: response.data.status };
  }

  // 2. Capture Order & Upgrade User
  async captureOrder(orderId: string, userId: string) {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // Check if PayPal says "COMPLETED"
      if (response.data.status === "COMPLETED") {
        // --- CRITICAL: Upgrade the User in DB ---
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            isPro: true,
            proExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }, // +30 days
          { new: true },
        );

        return {
          success: true,
          status: "COMPLETED",
          isPro: updatedUser?.isPro,
        };
      }

      return { success: false, status: response.data.status };
    } catch (error: any) {
      // Handle cases where order is already captured or invalid
      throw new AppError(
        "Could not capture payment. It may have already been processed.",
        StatusCodes.BAD_REQUEST,
      );
    }
  }
}

export const paymentService = new PaymentService();
