import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

export const CLIENT_ID =
  "342224914071-disnoblsrvm8ka8fb9n69fucfjp2t9im.apps.googleusercontent.com";

const CLIENT_SECRET = "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";

export const client = new OAuth2Client(CLIENT_ID);

// verify().catch(console.error);
