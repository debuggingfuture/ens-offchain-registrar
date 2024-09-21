import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains';
import crypto from 'crypto'


// https://developers.cloudflare.com/workers/runtime-apis/web-crypto/#

async function generateKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

function getCookieValue(name:string) {
  const cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === name) {
          return value;
      }
  }
  return null;
}


export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    // [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ccipRead: {
    // data is the binary calldata
    async request({ data, sender, urls }) {

      console.log('ccip read here', data, sender, urls);
      let url = urls?.[0];

      // use SameSite=None; Secure and credentials:include later to skip this step
      const token = getCookieValue('auth_token') || 'password';
      console.log('token', token);
      
      // const getUrl  = url.replace('{sender}', sender).replace('{data}', data);
      
      // load from dns txt record
      const encryptedHash = "+NqvZYSQACT+Q45bRiYtQbQV1i+ifFrye8M9IPgp04vBfmDJdXtnzq8Kl5EvEbWypQj9at/NKBA4CmR3itxeS33oJS0HKRtPLa1NycAxuWCgvVAAJ2WT";

      
      // TODO replace contract
      
      // consider adding nonce to avoid replay attack

      const postUrl  = url.replace('{sender}', sender).replace('/{data}.json', '');


      console.log('post', postUrl, data, token)

      const results = await fetch(postUrl, {
        method: 'POST',
        body: JSON.stringify({ data, token, encryptedHash }),
        // after CF supports so
        // credentials: 'include',
    })
        .then((res) => res.json())
        .catch((err) => {
          console.log('err', err)
        });


    //   const results = await fetch(url, {
    //     // after CF supports so
    //     // credentials: 'include',
    // })
    //     .then((res) => res.json())


      // TODO
      const { data: ccipData , key} = results;

      console.log('data', ccipData, key );
      return ccipData;
      
    }
  },
})