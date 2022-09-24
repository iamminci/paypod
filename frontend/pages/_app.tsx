import "@styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@components/Navbar";
import { useEffect, useState } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  Theme,
  lightTheme,
  Chain,
} from "@rainbow-me/rainbowkit";
import { publicProvider } from "wagmi/providers/public";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import merge from "lodash.merge";

const avalancheChain: Chain = {
  id: 43_114,
  name: "Avalanche",
  network: "avalanche",
  iconUrl: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=023",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: "https://api.avax.network/ext/bc/C/rpc",
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://snowtrace.io" },
    etherscan: { name: "SnowTrace", url: "https://snowtrace.io" },
  },
  testnet: false,
};

const fujiChain: Chain = {
  id: 43_113,
  name: "Fuji",
  network: "fuji",
  iconUrl: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=023",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "fuji",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: "https://api.avax-test.network/ext/bc/C/rpc",
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://testnet.snowtrace.io/" },
    etherscan: { name: "SnowTrace", url: "https://testnet.snowtrace.io/" },
  },
  testnet: true,
};

const swimmerNetwork: Chain = {
  id: 73772,
  name: "Swimmer Network",
  network: "swimmer",
  iconUrl: "/swimmer.png",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Treasure Under Sea",
    symbol: "TUS",
  },
  rpcUrls: {
    default: "https://avax-cra-rpc.gateway.pokt.network/",
  },
  blockExplorers: {
    default: {
      name: "Swimmer Explorer",
      url: "https://explorer.swimmer.network/",
    },
    etherscan: {
      name: "Swimmer Explorer",
      url: "https://explorer.swimmer.network/",
    },
  },
  testnet: false,
};

const dfkChain: Chain = {
  id: 53935,
  name: "DFK Subnet",
  network: "DFK",
  iconUrl: "/dfk.png",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Jewel",
    symbol: "JEWEL",
  },
  rpcUrls: {
    default:
      "https://avax-dfk.gateway.pokt.network/v1/lb/6244818c00b9f0003ad1b619//ext/bc/q2aTwKuyzgs8pynF7UXBZCU7DejbZbZ6EUyHr3JQzYgwNPUPi/rpc",
  },
  blockExplorers: {
    default: {
      name: "DFK Explorer",
      url: "https://subnets.avax.network/defi-kingdoms/dfk-chain/explorer",
    },
    etherscan: {
      name: "DFK Explorer",
      url: "https://subnets.avax.network/defi-kingdoms/dfk-chain/explorer",
    },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [avalancheChain, fujiChain, swimmerNetwork, dfkChain],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "PayPod",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

/* Theming */
const theme = extendTheme({
  styles: {
    global: {
      "*": {
        fontFamily: "Montserrat",
      },
      a: {
        _hover: {
          textDecoration: "underline",
        },
      },
      h1: {
        fontSize: "4xl",
        fontWeight: "bold",
      },
      h2: {
        fontSize: "2xl",
        fontWeight: "bold",
      },
      h3: {
        fontSize: "lg",
      },
      h4: {
        fontSize: "md",
      },
    },
  },
});

/* RainbowKit Theming */
const customTheme = merge(lightTheme(), {
  colors: {
    accentColor: "#FF2222",
  },
} as Theme);

function MyApp({ Component, pageProps, router }: AppProps) {
  const [mounted, setMounted] = useState(false);

  // prevent hydration UI bug: https://blog.saeloun.com/2021/12/16/hydration.html
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} theme={customTheme}>
          <ChakraProvider theme={theme}>
            <Navbar />
            <Component {...pageProps} key={router.route} />
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;
