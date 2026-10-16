// Email Worker for contact@dfxa.at (Cloudflare Email Routing).
//
// Forwards every incoming enquiry to the own mailboxes of all experts of the
// network; there is no shared mailbox (see the privacy policy). The
// destination addresses are not stored in the repository: they are set as
// the Worker secret FORWARD_TO (comma-separated) and must be verified as
// destination addresses in Email Routing.

export default {
  async email(message, env) {
    const destinations = (env.FORWARD_TO || "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    if (destinations.length === 0) {
      // Reject rather than silently drop: the sender gets a bounce.
      message.setReject("This address is temporarily unavailable.");
      return;
    }

    const results = await Promise.allSettled(destinations.map((to) => message.forward(to)));
    const failed = results.filter((r) => r.status === "rejected");
    for (const f of failed) console.error("forward failed:", f.reason);

    // Only bounce if no expert received the enquiry.
    if (failed.length === destinations.length) {
      message.setReject("The message could not be delivered.");
    }
  },
};
