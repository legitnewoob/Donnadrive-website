import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

dotenv.config();

// Dev workaround for corporate proxies that re-sign TLS certs (e.g. Zscaler).
// In production set NODE_ENV=production and provide a proper CA cert via NODE_EXTRA_CA_CERTS.
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '0';
}

const app = express();
const port = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || FRONTEND_URL;
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-change-me";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

const googleClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

interface User {
  email: string;
  name: string;
  picture?: string;
  googleRefreshToken?: string;
  googleAccessToken?: string;
  plan?: string;
  subscriptionStatus?: string;
  customerId?: string;
}

const users = new Map<string, User>();

const paidPlans: Record<
  string,
  { title: string; subtitle: string; amount: number; currency: string }
> = {
  adi: {
    title: "ADI Plan",
    subtitle: "For qualified instructors",
    amount: 1000,
    currency: "gbp",
  },
  "driving-school": {
    title: "Driving School Plan",
    subtitle: "Multiple instructors",
    amount: 700,
    currency: "gbp",
  },
};

interface AuthenticatedRequest extends Request {
  user?: { email: string; name: string; picture?: string };
}

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = header.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      name: string;
      picture?: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Stripe webhook needs the raw body before express.json()
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/google", async (req, res) => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  try {
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: GOOGLE_REDIRECT_URI,
    });

    const idToken = tokens.id_token;
    if (!idToken) {
      res.status(400).json({ error: "No ID token from Google" });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ error: "Invalid Google token" });
      return;
    }

    const { email, name, picture } = payload;
    if (!email) {
      res.status(400).json({ error: "Google account has no email" });
      return;
    }

    const user: User = {
      email,
      name: name || email,
      picture: picture || "",
    };
    if (tokens.refresh_token) user.googleRefreshToken = tokens.refresh_token;
    if (tokens.access_token) user.googleAccessToken = tokens.access_token;

    users.set(email, user);

    const accessToken = jwt.sign(
      { email, name: user.name, picture: user.picture },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, accessToken });
  } catch (err: any) {
    console.error("Google auth error:", err.message);
    res.status(400).json({ error: "Google sign-in failed", message: err.message });
  }
});

app.post("/api/auth/google-calendar", authMiddleware, async (req, res) => {
  const { code } = req.body;
  const user = (req as AuthenticatedRequest).user!;

  if (!code) {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  try {
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: GOOGLE_REDIRECT_URI,
    });

    const existing = users.get(user.email) || { ...user };
    if (tokens.refresh_token) existing.googleRefreshToken = tokens.refresh_token;
    if (tokens.access_token) existing.googleAccessToken = tokens.access_token;
    users.set(user.email, existing);

    res.json({ success: true });
  } catch (err: any) {
    console.error("Calendar auth error:", err.message);
    res.status(400).json({ error: "Calendar connection failed", message: err.message });
  }
});

app.post("/api/payment/create-checkout-session", authMiddleware, async (req, res) => {
  const { planSlug } = req.body;
  const user = (req as AuthenticatedRequest).user!;

  if (!planSlug) {
    res.status(400).json({ error: "Missing planSlug" });
    return;
  }

  const plan = paidPlans[planSlug];
  if (!plan) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            unit_amount: plan.amount,
            product_data: {
              name: plan.title,
              description: plan.subtitle,
            },
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment?plan=${planSlug}`,
      customer_email: user.email,
      client_reference_id: user.email,
      metadata: { planSlug },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe session error:", err.message);
    res.status(500).json({ error: "Payment session failed", message: err.message });
  }
});

app.post("/api/payment/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string | string[] | undefined;
  const signature = typeof sig === "string" ? sig : undefined;

  if (!signature) {
    res.status(400).json({ error: "Missing stripe-signature" });
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    res.status(400).json({ error: "Webhook signature verification failed" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.client_reference_id || session.customer_email;

    if (email && typeof email === "string" && users.has(email)) {
      const user = users.get(email)!;
      user.subscriptionStatus = "active";
      user.plan = session.metadata?.planSlug || user.plan;
      user.customerId =
        typeof session.customer === "string" ? session.customer : undefined;
      users.set(email, user);
    }
  }

  res.json({ received: true });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
