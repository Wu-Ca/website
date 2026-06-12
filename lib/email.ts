// Email delivery for magic links. Uses Resend when RESEND_API_KEY is set;
// otherwise logs the link to the server console (local development).

export async function sendMagicLinkEmail(
  to: string,
  url: string
): Promise<{ delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      [
        "",
        "✉️  Magic sign-in link (no RESEND_API_KEY configured, email not sent)",
        `    To:   ${to}`,
        `    Link: ${url}`,
        "",
      ].join("\n")
    );
    return { delivered: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "CommonGround NYC <onboarding@resend.dev>",
      to,
      subject: "Your sign-in link for CommonGround NYC",
      text: `Click the link below to sign in to CommonGround NYC. It expires in 15 minutes.\n\n${url}\n\nIf you didn't request this, you can safely ignore this email.`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #064e3b;">Sign in to CommonGround NYC</h2>
          <p>Click the button below to sign in. This link expires in 15 minutes and can only be used once.</p>
          <p style="margin: 24px 0;">
            <a href="${url}" style="background: #065f46; color: #fff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600;">Sign in</a>
          </p>
          <p style="color: #78716c; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to send magic link email (${res.status}): ${body}`);
  }
  return { delivered: true };
}
