import {randomBytes,scryptSync} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
const email=process.argv[2];if(!email?.includes('@'))throw new Error('Usage: node deploy/create-admin.mjs admin@example.com');
const password=randomBytes(24).toString('base64url'),salt=randomBytes(16).toString('hex');
mkdirSync('deploy/private',{recursive:true,mode:0o700});
writeFileSync('deploy/private/new-admin.env',`ADMIN_EMAILS=${email}\nADMIN_PASSWORD_HASH=${salt}:${scryptSync(password,salt,64).toString('hex')}\nSESSION_SECRET=${randomBytes(48).toString('base64url')}\n`,{mode:0o600,flag:'wx'});
writeFileSync('deploy/private/new-admin-access.txt',`邮箱：${email}\n密码：${password}\n`,{mode:0o600,flag:'wx'});
console.log('Credentials saved in deploy/private; merge new-admin.env into the server .env.production.');
