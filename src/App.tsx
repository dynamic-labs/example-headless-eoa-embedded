import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";

import { DYNAMIC_ENVIRONMENT_ID } from "./constants";
import { Home } from "./home";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <DynamicWidget />
      <Home />
    </DynamicContextProvider>
  );
}
