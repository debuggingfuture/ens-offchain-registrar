import { Button, Input } from '@ensdomains/thorin'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useAccount, useEnsAddress, useEnsResolver, useEnsText, useReadContract, useSignMessage } from 'wagmi'

import { Footer } from '@/components/Footer'
import { useDebounce } from '@/hooks/useDebounce'
import { useFetch } from '@/hooks/useFetch'
import { Card, Form, Helper, Link, Spacer } from '@/styles'
import { WorkerRequest } from '@/types'
import { createWalletClient, custom, recoverMessageAddress } from 'viem'
import { sepolia } from 'viem/chains'
import React from 'react'


const SIGN_MESSAGE = 'MAGIC';

export function SignMessage() {
  // const recoveredAddress = React.useRef<string>()
  const { data: signMessageData, error, signMessage, variables } = useSignMessage()


  React.useEffect(() => {
    ; (async () => {
      if (variables?.message && signMessageData) {
        console.log('variables?.message', variables?.message)
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: signMessageData,
        })
        console.log('recoveredAddress', recoveredAddress)
        // setRecoveredAddress(recoveredAddress)
      }
    })()
  }, [signMessageData, variables?.message])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        //@ts-ignore
        const formData = new FormData(event.target)
        // const message = formData.get('message')
        signMessage({ message: SIGN_MESSAGE })
      }}
    >


      <Button
        disabled={false}
        type='submit'
      // loading={isLoading || gatewayIsLoading}
      >
        Sign Message
      </Button>

      {signMessageData && (
        <div>
          {/* <div>Recovered Address: {recoveredAddress.current}</div> */}
          <div>Signature: {signMessageData}</div>
        </div>
      )}

      {error && <div>{error.message}</div>}
    </form>
  )
}

export default function App() {
  const { address } = useAccount()

  // const endpoint = 'http://localhost:8787';
  const endpoint = 'https://ens-gateway.debuggingfuturecors.workers.dev';

  const [name, setName] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState<string | undefined>(undefined)
  const [baseAddress, setBaseAddress] = useState<string | undefined>(address)
  const [arbAddress, setArbAddress] = useState<string | undefined>(address)

  const { data: signMessageData, error, signMessage, variables } = useSignMessage()


  const [authToken, setAuthToken] = useState<string | undefined>(undefined)

  const { isLoading, data: resolver } = useEnsResolver({
    name: 'ethsg24.eth',
  })



  // add resolver signature there
  // check gateway private key etc


  const { data: ensTextPreview1, isLoading: isEnsTextPreview1Loading } = useEnsText({
    // public resolver
    // universalResolverAddress: resolver,
    key: 'encryptedHash',
    chainId: sepolia.id,
    name: 'preview2.ethsg24.eth',
  });


  const { data: ensAddress, isLoading: isLoadingEns, refetch } = useEnsAddress({
    universalResolverAddress: resolver,
    chainId: sepolia.id,
    name: 'ethsg24.eth',
    query: {
      enabled: false
    }
  });

  // manual resolve

  // const result = useReadContract({
  //   abi,
  //   address: 'resolver',
  //   functionName: 'resolve',
  // })

  // const { data: ensText, isLoading: isLoadingEnsText, refetch } = useEnsText({
  //   universalResolverAddress: resolver,
  //   // blockTag: 'latest',
  //   name: 'ethsg24.eth',
  // })

  useEffect(() => {
    console.log('request', resolver, isLoading)
    if (resolver && authToken) {
      refetch();
    }
  }, [isLoading, authToken])

  useEffect(() => {
    console.log('ensTextPreview1', ensTextPreview1, isEnsTextPreview1Loading)

    document.cookie = `targetEncryptedHash=${ensTextPreview1}; path=/;`;
  }, [isEnsTextPreview1Loading])

  useEffect(() => {
    console.log('resolver', ensAddress, isLoadingEns)
  }, [isLoadingEns])

  const regex = new RegExp('^[a-z0-9-]+$')
  const debouncedName = useDebounce(name, 500)
  const enabled = !!debouncedName && regex.test(debouncedName)


  useEffect(() => {
    setAuthToken(signMessageData);
    console.log('update auth_token', signMessageData)

    document.cookie = `auth_token=${signMessageData}; path=/;`;
  }, [signMessageData, setAuthToken, error])

  const nameData: WorkerRequest['signature']['message'] = {
    name: `${debouncedName}.ethsg24.eth`,
    owner: address!,
    // https://docs.ens.domains/web/resolution#multi-chain
    addresses: {
      '60': address,
      '2147492101': baseAddress,
      '2147525809': arbAddress,
    },
    texts: { description },
  }

  // const requestBody: WorkerRequest = {
  //   signature: {
  //     hash: data!,
  //     message: nameData,
  //   },
  //   expiration: new Date().getTime() + 60 * 60, // 1 hour
  // }

  // const {
  //   data: gatewayData,
  //   error: gatewayError,
  //   isLoading: gatewayIsLoading,
  // } = useFetch(data && `${endpoint}/set`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(requestBody),
  // })

  return (
    <>
      <Head>
        <title>Offchain ENS Registrar</title>
        <meta property="og:title" content="Offchain ENS Registrar" />
        <meta
          name="description"
          content="Quick demo of how offchain ENS names work"
        />
        <meta
          property="og:description"
          content="Quick demo of how offchain ENS names work"
        />
      </Head>

      <Spacer />


      <Card>
        <ConnectButton showBalance={false} />


        <Form
          onSubmit={(e) => {
            e.preventDefault()
            signMessage({ message: JSON.stringify(nameData) })
          }}
        >
          <Input
            type="text"
            label="Name"
            suffix=".ethsg24.eth"
            placeholder="ens"
            required
            disabled={!!signMessageData || !address}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="text"
            label="ETH Address"
            defaultValue={address}
            disabled
          />


          <Button
            type="submit"
            disabled={!enabled || !!signMessageData}
          // loading={isLoading || gatewayIsLoading}
          >
            Sign Message
          </Button>
        </Form>

      </Card>

      <Footer />
    </>
  )
}
