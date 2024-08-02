import { FC } from "react";

import {
  EmbeddedWalletChainEnum,
  EmbeddedWalletProviderEnum,
  VerifyRequestFromJSON
} from "@dynamic-labs/sdk-api-core";

import {useUserWallets, useRefreshUser} from '@dynamic-labs/sdk-react-core';
import { generateMessageToSign } from '@dynamic-labs/multi-wallet';
import { mainnet } from "viem/chains";
import {createWalletClient, http} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

import { DYNAMIC_ENVIRONMENT_ID } from "./constants";
import { dynamicApi } from "./api";

export const Home: FC = () => {
  const refreshUser = useRefreshUser();
  const userWallets = useUserWallets();

  const consumeNonce = () => {
    const nonceString = localStorage['dynamic_nonce'];
    if (nonceString) {
      const nonceObject= JSON.parse(nonceString)
      const nonce = nonceObject.value;
      localStorage.removeItem('dynamic_nonce');
      return nonce;
    }
  }

  const genTestWallet = () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    return createWalletClient({
      account,
      chain: mainnet,
      transport: http()
    });
  }

  const callVerifyUser = async (messageToSign: string, address: string, signedMessage: string) => {
    const verifyRequest = VerifyRequestFromJSON({
      chain: 'EVM',
      messageToSign,
      network: "1",
      publicWalletAddress: address,
      signedMessage,
      walletName: 'unknown',
      walletProvider: 'browserExtension'
    });

    try {
      const response = await dynamicApi().verify({
        environmentId: DYNAMIC_ENVIRONMENT_ID,
        verifyRequest,
      });
      console.log(response);
      window.localStorage.setItem(
        'dynamic_authentication_token',
        JSON.stringify(response.jwt),
      );

      window.localStorage.setItem(
        'dynamic_min_authentication_token',
        JSON.stringify(response.jwt),
      );
    } catch (error) {
      console.log('error', error);
    }
  }

  const handleVerifyWallet = async () => {
    const wallet = genTestWallet();
    const [address] = await wallet.getAddresses()
    const nonce = consumeNonce();
    console.log({address, nonce})

    const messageToSign = generateMessageToSign({
      blockchain: 'EVM',
      chainId: 1,
      domain: window.location.host,
      nonce,
      publicKey: address,
      requestId: DYNAMIC_ENVIRONMENT_ID,
      uri: window.location.href,
    })

    const signedMessage = await wallet.signMessage({message : messageToSign});
    await callVerifyUser(messageToSign, address, signedMessage);
    refreshUser();
  }

  const handleCreateEmbeddedWallet = async () => {
    // Call Dynamic API to create an embedded wallet
    await dynamicApi().createEmbeddedWallets({
      createEmbeddedWalletsRequest: {
        embeddedWallets: [
          {
            chains: [EmbeddedWalletChainEnum.Evm],
            embeddedWalletProvider: EmbeddedWalletProviderEnum.Turnkeyhd,
            isAuthenticatorAttached: false,
          },
        ],
      },
      environmentId: DYNAMIC_ENVIRONMENT_ID,
    });

    // Refresh the user to see the new wallet
    refreshUser();
  };

  const handleSignMessage = async () => {
    // Find the embedded wallet in the user's wallets
    const embeddedWallet = userWallets.find((w) => w.key === 'turnkeyhd' && w.chain === 'eip155')

    // Sign a message using the EVM embedded wallet
    const signedMessage = await embeddedWallet?.connector.signMessage('Hello, world!');
    console.log('Signed message:', signedMessage);
  };

  return (
    <div style={{ padding: '30px'}}>
    <div>
    <button onClick={handleVerifyWallet}>
    Verify EOA wallet
    </button>
    <button onClick={handleCreateEmbeddedWallet}>
    Create embedded wallet
    </button>
    <button onClick={handleSignMessage}>
    Sign message w/ embedded wallet
    </button>
    </div>
    <h3>Branded Wallet</h3>
    <pre>{JSON.stringify(userWallets.find((w) => w.key !== 'turnkeyhd'), null, 4)}</pre>
    <h3>Embedded Wallet</h3>
    <pre>{JSON.stringify(userWallets.find((w) => w.key === 'turnkeyhd'), null, 4)}</pre>
    <h3>All Wallets</h3>
    <pre>{JSON.stringify(userWallets, null, 4)}</pre>
    </div>
  );
};
