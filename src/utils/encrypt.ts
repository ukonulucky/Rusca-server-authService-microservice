import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from(process.env.JWT_SECRET as string, 'base64');
    
     

function toBase64url(input: Buffer): string {
    return input.toString('base64')
      .replace(/\+/g, '-') // plus to dash
      .replace(/\//g, '_') // slash to underscore
      .replace(/=+$/, ''); // remove trailing =
  }
  








export function encrypt(text: string): string {
    if (!secretKey) throw new Error("No secretKey");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text.toString(), 'utf8'), cipher.final()]);
    const combined = Buffer.concat([iv, encrypted]);
    return toBase64url(combined).toString();
}


  



