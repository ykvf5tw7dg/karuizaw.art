import { env } from "@/lib/runtime-env";
export function applicationDb(){if(!env.DB)throw new Error("APPLICATION_STORAGE_UNAVAILABLE");return env.DB;}

export function applicationBucket(){if(!env.BUCKET)throw new Error("PHOTO_STORAGE_UNAVAILABLE");return env.BUCKET;}
