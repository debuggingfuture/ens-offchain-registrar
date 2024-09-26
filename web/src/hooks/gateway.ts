// from https://usehooks-ts.com/react-hook/use-fetch
import { useEffect, useReducer, useRef } from 'react'
import { useFetch } from './useFetch';
import { useQuery } from '@tanstack/react-query';
import { sepolia } from 'viem/chains';
import { createSiweMessage, generateSiweNonce } from 'viem/siwe'
import { Address, Hex } from 'viem';
import { useEnsName, useSignMessage } from 'wagmi';
import { signMessage } from 'viem/accounts';

const GATEWAY_ENDPOINT = process.env.GATEWAY_ENDPOINT || 'http://localhost:8787';
// 'https://ens-gateway.debuggingfuturecors.workers.dev';

const fetchWhitelistPost = async ({address, name}:{address:string, name:string })=>{ 
  return fetch(`${GATEWAY_ENDPOINT}/set`, {
    method: 'POST',
    body: JSON.stringify({ addresses:{
      'mainnet': address
    }, name }),
  })
}



// use a proper nonce for security. Ignored at this demo
const fetchAuth = ({address, signature}:{address:Hex, signature: Hex})=>{
 
  return fetch(`${GATEWAY_ENDPOINT}/signin`, {
    method: 'POST',
    body: JSON.stringify({ address, signature }),
  })
}



export function useAuth<T = unknown>(
  address?: Hex,
) {

  const { signMessage, data: signature } = useSignMessage();



  const { refetch, error } = useQuery({ 
    queryKey: [address],
    enabled: false,
    queryFn: async ()=>{

      if(!address){
        return;
      }
    
    console.log('fetch auth', address)
    const message = createSiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in with Ethereum to the app.',
      uri: window.location.origin,
      version: '1',
      chainId: sepolia.id,
      nonce: generateSiweNonce(),
    })


  console.log('message', message)

   signMessage({
    account:address,
    message
  });
  

  if(signature){
    return fetchAuth({
      address,
      signature
      // signature: '0x'
    });
  }

  } });

  return {
    auth: ()=>{
      console.log('auth', address)
      refetch();
    }  
  }

}



export function useAddWhitelist<T = unknown>(
  {
    address,
    name
  }:{
    address?: string,
    name?:string | null
  }
) {

  const { refetch } = useQuery({ queryKey: [name], queryFn: async ()=>{
    if(!name|| !address) return;
    return fetchWhitelistPost({name, address});
  } });


  return {
    addWhietlist: ()=>{
      console.log('add whitelist', address, name)
      refetch();
    }  
  }

}
