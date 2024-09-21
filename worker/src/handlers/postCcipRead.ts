import { IRequest } from 'itty-router'
import { recoverMessageAddress, Hex } from 'viem'
import { sign } from 'viem/accounts'
import {
  concat,
  decodeFunctionData,
  encodeAbiParameters,
  encodePacked,
  isAddress,
  isHex,
  keccak256,
  toHex,
} from 'viem/utils'
import { z } from 'zod'

import { handleQuery } from '../ccip-read/query'
import { resolverAbi } from '../ccip-read/utils'
import { Env } from '../env'

const schema = z.object({
  sender: z.string().refine((data) => isAddress(data)),
  // data: z.string().refine((data) => isHex(data)),
})


const SIGN_MESSAGE = 'MAGIC';

export const checkWhitelist = (address:string)=>{

  // TODO load from cloudflare D1 or txt records
  const whitelist = ['0xC26F9D134624D6f84152c4B132b369941ca4F1eE', '0x203Ab3B849E97c409335b5a1a3a33a6387B075B6','0x7f890c611c3B5b8Ff44FdF5Cf313FF4484a2D794']
  .map((address)=>address.toLowerCase());


  return whitelist.includes(address.toLowerCase());

}

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer:any) {
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(buffer)]));
}

function base64ToArrayBuffer(base64:string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}


const ENCRYPTION_KEY_JWK = {
  "kty": "oct",
  "key_ops": [
      "encrypt",
      "decrypt"
  ],
  "alg": "A256GCM",
  "ext": true,
  "k": "O2URt6f4xF_pQDLAiT3VWWuLee-YQHDhOOFEJHv8SHE"
};

async function importKeyFromJwk(jwk:any) {
  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// to quickly generate hash for demo
export const encryptDemo = async ()=>{
    const message = "bafybeifr5olumz4wa4z2hvyhj2qh74z6q5uc2fw3tdhzaqqhk3jdxlc3se";

    const key = await  importKeyFromJwk(ENCRYPTION_KEY_JWK);
    // const key = await generateKey();
    const encrypted = await encrypt(message, key);

    const encryptedBase64 =  arrayBufferToBase64(encrypted);
    
    const decrypted = await decrypt(encrypted, key);
    // @ts-ignore
    const exportedKey = await crypto.subtle.exportKey('jwk', key );

    console.log('exportedKey', JSON.stringify(exportedKey));
    console.log('encrypted', encryptedBase64);
    console.log('decrypted', decrypted);
}


// Function to convert string to Uint8Array
function str2ab(str:string) {
  return new TextEncoder().encode(str);
}

// Function to convert Uint8Array to string
function ab2str(buf:any) {
  return new TextDecoder().decode(buf);
}

// Generate a random key
async function generateKey() {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt function
async function encrypt(plaintext:string, key:any) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = str2ab(plaintext);
  
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encodedText
  );
  
  const encryptedData = new Uint8Array(iv.length + ciphertext.byteLength);
  encryptedData.set(iv);
  encryptedData.set(new Uint8Array(ciphertext), iv.length);
  
  return encryptedData;
}

// Decrypt function
async function decrypt(encryptedData:any, key:any) {
  const iv = encryptedData.slice(0, 12);
  const ciphertext = encryptedData.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    ciphertext
  );
  
  return ab2str(decrypted);
}

// Implements EIP-3668
// https://eips.ethereum.org/EIPS/eip-3668
export const postCcipRead = async (request: IRequest, env: Env) => {
  const safeParse = schema.safeParse(request.params)
  const body: any = await request.json();
  const data = body.data;

  
  // pre-loaded from dns txt record
  // const encryptedHash = "+NqvZYSQACT+Q45bRiYtQbQV1i+ifFrye8M9IPgp04vBfmDJdXtnzq8Kl5EvEbWypQj9at/NKBA4CmR3itxeS33oJS0HKRtPLa1NycAxuWCgvVAAJ2WT";

  const encryptedHash = base64ToArrayBuffer(body?.encryptedHash);

  
  const key = await importKeyFromJwk(ENCRYPTION_KEY_JWK);


  console.log('body', body);

  const address = await recoverMessageAddress({
    message: toHex(SIGN_MESSAGE), // Convert the message to hex
    signature: body?.token,
  });

  const isWhiteListed = checkWhitelist(address);

  console.log('recovered address', address, isWhiteListed);
  
  if (!isWhiteListed) {
    return Response.json({ error: "YOU SHALL NOT PASS" }, { status: 400 })
  }


  if (!safeParse.success) {
    return Response.json({ error: safeParse.error }, { status: 400 })
  }

  
  const decrypted = await decrypt(encryptedHash, key);
  console.log('decrypted', decrypted);

  const { sender } = safeParse.data

  console.log('postCcipRead', { sender })

  await encryptDemo();


  const decodedResolveCall = decodeFunctionData({
    abi: resolverAbi,
    data: data,
  })

  const { result, ttl } = await handleQuery({
    dnsEncodedName: decodedResolveCall.args[0],
    encodedResolveCall: decodedResolveCall.args[1] as Hex,
    env,
  })
  const validUntil = Math.floor(Date.now() / 1000 + ttl)


  // pass extraParams decrypted

  // Specific to `makeSignatureHash()` in the contract https://etherscan.io/address/0xDB34Da70Cfd694190742E94B7f17769Bc3d84D27#code#F2#L14
  const messageHash = keccak256(
    encodePacked(
      ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
      [
        '0x1900',
        sender,
        BigInt(validUntil),
        keccak256(data),
        keccak256(result), 
      ]
    )
  )

  const sig = await sign({
    hash: messageHash,
    privateKey: env.PRIVATE_KEY,
  })
  const sigData = concat([sig.r, sig.s, toHex(sig.v!)])

  // An ABI encoded tuple of `(bytes result, uint64 expires, bytes sig)`, where
  // `result` is the data to return to the caller, and
  // `sig` is the (r,s,v) encoded message signature.
  // Specific to `verify()` in the contract https://etherscan.io/address/0xDB34Da70Cfd694190742E94B7f17769Bc3d84D27#code#F2#L14
  const encodedResponse = encodeAbiParameters(
    [
      { name: 'result', type: 'bytes' },
      { name: 'expires', type: 'uint64' },
      { name: 'sig', type: 'bytes' },
    ],
    [result, BigInt(validUntil), sigData]
  )
  // "0x-prefixed hex string containing the result data."
  return Response.json({ data: encodedResponse, decrypted }, { status: 200, headers: { 'Set-Cookie': 'b=1234' } })
}
