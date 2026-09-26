import {database,bucket} from './server/storage';
export const env={DB:database,BUCKET:bucket,ADMIN_EMAILS:process.env.ADMIN_EMAILS,MAIL_RELAY_URL:process.env.MAIL_RELAY_URL,MAIL_RELAY_TOKEN:process.env.MAIL_RELAY_TOKEN,NOTIFY_TO:process.env.NOTIFY_TO,SITE_ORIGIN:process.env.SITE_ORIGIN};
