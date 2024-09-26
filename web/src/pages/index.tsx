import { Button, DotGridSVG, Dropdown, ExitSVG, Input } from '@ensdomains/thorin'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useAccount, useEnsName, useEnsResolver, useEnsText, useSignMessage } from 'wagmi'
import { normalize } from 'viem/ens'

import { Footer } from '@/components/Footer'
import { useDebounce } from '@/hooks/useDebounce'
import { useFetch } from '@/hooks/useFetch'
import { Card, Form, Helper, Link, Spacer } from '@/styles'
import { WorkerRequest } from '@/types'
import { DropdownItem } from '@ensdomains/thorin/dist/types/components/molecules/Dropdown/Dropdown'
import { sepolia } from 'viem/chains'
import { useAddWhitelist, useAuth } from '@/hooks/gateway'

export default function App() {
  const { address, isConnected } = useAccount()

  const [description, setDescription] = useState<string | undefined>(undefined)

  const [targetDomain, setTargetDomain] = useState<string | undefined>(undefined)
  // useEnsResolver();



  // const { data: ensTextTarget, isLoading: isEnsTextTargetLoading, refetch } = useEnsText({
  //   key: 'encryptedHash',
  //   chainId: sepolia.id,
  //   name: targetDomain,
  //   query: {
  //     enabled: false
  //   }
  // });


  const { data: name, isFetched } = useEnsName({
    address,
    chainId: sepolia.id,

  })


  const { addWhietlist } = useAddWhitelist({
    address,
    name
  });

  const { data: signMessageData, signMessage, variables } = useSignMessage()

  const { auth } = useAuth(address);

  // const nameData: WorkerRequest['signature']['message'] = {
  //   name: `${debouncedName}.offchaindemo.eth`,
  // }

  // const requestBody: WorkerRequest = {
  //   signature: {
  //     hash: signMessageData!,
  //     message: nameData,
  //   },
  //   expiration: new Date().getTime() + 60 * 60, // 1 hour
  // }

  const createSelect = (targetDomain: string) => () => {
    setTargetDomain(targetDomain);
  }

  const items: DropdownItem[] = [
    {
      label: 'preview1.eth24sg.eth',
      value: 'preview1.eth24sg.eth',
      onClick: createSelect('preview1.eth24sg.eth'),
      color: 'text',
    },
    {
      label: 'preview2.eth24sg.eth',
      value: 'preview2.eth24sg.eth',
      onClick: createSelect('preview2.eth24sg.eth'),
      color: 'red',
    },
  ]

  return (
    <>
      <Head>
        <title>Onchain ENS TXT with Offchain Whitelist gating</title>
        <meta property="og:title" content=">Onchain ENS TXT with Offchain Whitelist gating" />
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

        <Dropdown
          align="left"
          width='250px'
          items={items}
          label={targetDomain || "Select Target"}
        />

        <Button
          disabled={!targetDomain || !isConnected}
          onClick={() => {
            auth();
          }}
        >
          Sign SIWE
        </Button>

        <hr />
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            if (address) {
              addWhietlist();

            }

            // signMessage({ message: JSON.stringify(nameData) })
          }}
        >



          <a href={"/redirect?target=" + targetDomain} target="_blank">
            <Button
              disabled={!targetDomain || !isConnected}
            >
              Take me there
            </Button>
          </a>


          <Button
            type="submit"
            disabled={!targetDomain || !isConnected}
          >
            Add yourself to whitelist
          </Button>

        </Form>
        {/* 


        {gatewayError ? (
          <Helper type="error">
            {gatewayError.message === 'Conflict'
              ? 'Somebody already registered that name'
              : 'Something went wrong'}
          </Helper>
        ) : gatewayData ? (
          <Helper>
            <p>
              Visit the{' '}
              <Link href={`https://ens.app/${debouncedName}.offchaindemo.eth`}>
                ENS Manager
              </Link>{' '}
              to see your name
            </p>
          </Helper>
        ) : !!debouncedName && !enabled ? (
          <Helper type="error">Name must be lowercase alphanumeric</Helper>
        ) : null} */}
      </Card >

      <Footer />
    </>
  )
}
