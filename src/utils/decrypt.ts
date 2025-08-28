import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.JWT_SECRET as string, 'base64'); //secret key used for encryption



function fromBase64url(base64url: string): Buffer {
    const base64 = base64url
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
    return Buffer.from(base64, 'base64');
  }


export function decrypt(encryptedUrlSafe: string): string {
   
   if(!encryptedUrlSafe) return ""
    if (!secretKey) throw new Error("No secretKey");
    const combined = fromBase64url(encryptedUrlSafe);
    const iv = combined.slice(0, 16);
    const encryptedText = combined.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    console.log("decrypted data inner ", decrypted.toString('utf8'))
    return decrypted.toString('utf8');
}
