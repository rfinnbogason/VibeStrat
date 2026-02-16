import type { Express } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage-factory";
import { generateToken, authenticateJwt } from "./jwt-auth";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

export function registerAuthRoutes(app: Express) {
  // POST /api/auth/login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated" });
      }

      // If user has no passwordHash (legacy migrated user), they must reset
      if (!user.passwordHash) {
        return res.status(403).json({
          code: "MUST_RESET_PASSWORD",
          message: "We've upgraded our system. Please reset your password to continue.",
        });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check mustChangePassword
      if (user.mustChangePassword) {
        const token = generateToken({ userId: user.id, email: user.email! });
        return res.json({
          mustChangePassword: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      const token = generateToken({ userId: user.id, email: user.email! });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImageUrl: user.profileImageUrl,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // POST /api/auth/signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existingUser = await storage.getUserByEmail(email.toLowerCase().trim());
      if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const userId = crypto.randomUUID();

      const user = await storage.createUser({
        id: userId,
        email: email.toLowerCase().trim(),
        firstName: firstName || "",
        lastName: lastName || "",
        passwordHash,
        role: "chairperson",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const token = generateToken({ userId: user.id, email: user.email! });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("Signup error:", error?.message || error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // POST /api/auth/forgot-password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Always return success to prevent email enumeration
      const user = await storage.getUserByEmail(email.toLowerCase().trim());

      if (user) {
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await storage.updateUser(user.id, {
          passwordResetToken: hashedToken,
          passwordResetExpires: expires,
        });

        // Send email with reset link
        const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

        try {
          const { default: nodemailer } = await import("nodemailer");

          // Use SendGrid if available, otherwise fall back to console logging
          if (process.env.SENDGRID_API_KEY) {
            const sgMail = await import("@sendgrid/mail");
            sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);
            await sgMail.default.send({
              to: user.email!,
              from: process.env.FROM_EMAIL || "noreply@vibestrat.com",
              subject: "VibeStrat - Password Reset",
              html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your VibeStrat account.</p>
                <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;border-radius:6px;text-decoration:none;">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
              `,
            });
          } else {
            console.log(`Password reset link for ${user.email}: ${resetUrl}`);
          }
        } catch (emailError) {
          console.error("Failed to send reset email:", emailError);
          console.log(`Password reset link for ${user.email}: ${resetUrl}`);
        }
      }

      res.json({ message: "If an account exists with this email, you will receive a password reset link." });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // POST /api/auth/reset-password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      // Find user with this reset token that hasn't expired
      const user = await storage.getUserByResetToken(hashedToken);

      if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires) < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await storage.updateUser(user.id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        mustChangePassword: false,
      });

      res.json({ message: "Password reset successfully. You can now log in." });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // POST /api/auth/change-password
  app.post("/api/auth/change-password", authenticateJwt, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const user = req.user;

      // If user has a password, verify the current one
      if (user.passwordHash && currentPassword) {
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await storage.updateUser(user.id, {
        passwordHash,
        mustChangePassword: false,
      });

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // GET /api/auth/me
  app.get("/api/auth/me", authenticateJwt, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });
}
