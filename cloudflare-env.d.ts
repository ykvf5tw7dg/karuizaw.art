declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    ADMIN_EMAILS?: string;
    NOTIFY_TO?: string;
    SITE_ORIGIN?: string;
    MAIL_RELAY_URL?: string;
    MAIL_RELAY_TOKEN?: string;
    BUCKET?: R2Bucket;
  }
}
