import { FC } from "react";

import { useUserWallets, useRefreshUser } from "@dynamic-labs/sdk-react-core";
import {
  EmbeddedWalletChainEnum,
  EmbeddedWalletProviderEnum,
} from "@dynamic-labs/sdk-api-core";

import { DYNAMIC_ENVIRONMENT_ID } from "./constants";
import { dynamicApi } from "./api";

export const Home: FC = () => {
  const refreshUser = useRefreshUser();
  const userWallets = useUserWallets();

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
