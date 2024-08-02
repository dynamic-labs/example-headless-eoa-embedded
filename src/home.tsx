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

  return (
    <>
      <div>
        <button onClick={handleCreateEmbeddedWallet}>
          Create embedded wallet
        </button>
      </div>
      <pre>{JSON.stringify(userWallets, null, 4)}</pre>
    </>
  );
};
