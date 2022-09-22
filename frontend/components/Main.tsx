import styles from "@styles/Main.module.css";
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Image,
  Input,
  Switch,
  Spinner,
  Select,
} from "@chakra-ui/react";
import withTransition from "@components/withTransition";
import { useAccount } from "wagmi";
import { SimpleGrid } from "@chakra-ui/react";
import PieChart from "@components/PieChart";
import Gradient from "javascript-color-gradient";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import Create from "@components/Create";
import Pod from "@components/Pod";
import { abridgeLabel } from "@utils/helpers";

const gradientArray = new Gradient()
  .setColorGradient("#ff3131", "#ffb9b9")
  .getColors();

const data = [
  // {
  //   id: 999,
  //   label: "Demo Pod",
  //   address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
  //   value: 0,
  //   network: "Fuji Testnet",
  //   networkLogo: "/avax.png",
  //   lastTransacted: "--",
  // },
  {
    id: 0,
    label: "Pizza Game",
    address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
    value: 364.61,
    network: "Avalanche C-Chain",
    networkLogo: "/avax.png",
    lastTransacted: "09/17/22",
  },
  {
    id: 1,
    label: "Crabada",
    address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
    value: 429.39,
    network: "Swimmer Network",
    networkLogo: "/swimmer.png",
    lastTransacted: "09/13/22",
  },
  {
    id: 2,
    label: "HunnyPlay",
    address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
    value: 789.18,
    network: "Avalanche C-Chain",
    networkLogo: "/avax.png",
    lastTransacted: "09/08/22",
  },
  {
    id: 3,
    label: "DeFi Kingdoms",
    address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
    value: 1345.54,
    network: "DFK Subnet",
    networkLogo: "/dfk.png",
    lastTransacted: "09/01/22",
  },
  {
    id: 4,
    label: "Avaxtars",
    address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
    value: 335.3,
    network: "Avalanche C-Chain",
    networkLogo: "/avax.png",
    lastTransacted: "08/20/22",
  },
  {
    id: 5,
    label: "MetaDerby",
    address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
    value: 457.19,
    network: "Avalanche C-Chain",
    networkLogo: "/avax.png",
    lastTransacted: "08/17/22",
  },
  {
    id: 6,
    label: "Imperium Empires",
    address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
    value: 122.26,
    network: "Avalanche C-Chain",
    networkLogo: "/avax.png",
    lastTransacted: "08/07/22",
  },
  {
    id: 7,
    label: "Gunfire AVAX",
    address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
    value: 346.68,
    network: "Avalanche C-Chain",
    networkLogo: "/avax.png",
    lastTransacted: "08/03/22",
  },
  {
    id: 8,
    label: "Heroes of NFT",
    address: "0x17e547d79C04D01E49fEa275Cf32ba06554f9dF7",
    value: 138.18,
    network: "Avalanche C-Chain",
    networkLogo: "/avax.png",
    color: "#FF0000",
    lastTransacted: "07/01/22",
  },
];

const tokenData = data.map((token: any, idx: number) => {
  return {
    label: abridgeLabel(token.label),
    value: token.value,
    color: gradientArray[token.id],
  };
});

const sortedTokenData = [...tokenData].sort(
  (a: any, b: any) => b.value - a.value
);

const aggregateBalance = data.reduce((acc: any, token: any) => {
  return acc + Number(token.value);
}, 0);

function Main() {
  const router = useRouter();
  const { address } = useAccount();

  function getContent() {
    switch (router.asPath) {
      case "/":
        return <Overview />;
      case "/#create":
        return <Create />;
      case "/#pod":
        return <Pod />;
      default:
        return <Overview />;
    }
  }

  return <div className={styles.container}>{getContent()}</div>;
}

function Overview() {
  return (
    <HStack className={styles.contentContainer} gap={2}>
      <VStack className={styles.overviewContainer}>
        <Text className={styles.header}>Overview</Text>
        <Text className={styles.balanceHeader}>Your Total Balance</Text>
        <Text className={styles.fiatBalance}>
          ${aggregateBalance.toFixed(2)}
        </Text>
        <Box className={styles.pieChartContainer}>
          <PieChart data={tokenData} />
        </Box>
        <VStack className={styles.scoreListContainer}>
          {sortedTokenData.map(({ label, value, color }: any, idx: number) => (
            <HStack key={idx} className={styles.scoreContainer}>
              <Text className={styles.scoreTitleLabel}>{label}</Text>
              <Box className={`${styles.scoreBarContainer}`}>
                <Box
                  style={{
                    backgroundColor: color,
                    width: `${((value / aggregateBalance) * 100).toFixed(0)}%`,
                  }}
                  className={`${styles.scoreBar}`}
                ></Box>
              </Box>
              <Text className={styles.scoreLabel}>
                {((value / aggregateBalance) * 100).toFixed(0)}%
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
      <Box w="2rem"></Box>
      <VStack className={styles.podContainer}>
        <HStack className={styles.podHeaderContainer}>
          <Text className={styles.header}>Pods</Text>
          <Link href="/#create">
            <Button className={styles.createPod}>+ Create Pod</Button>
          </Link>
        </HStack>
        <SimpleGrid columns={3} gap={6} className={styles.podGrid}>
          {data.map(
            ({ label, value, network, networkLogo, lastTransacted }) => (
              <Link key={label} href="/#pod">
                <VStack className={styles.pod}>
                  <VStack className={styles.podTopSection}>
                    <Text className={styles.podTitle}>{label}</Text>
                    <Text className={styles.podBalance}>${value}</Text>
                    <HStack>
                      <Image
                        src={networkLogo}
                        alt={label}
                        className={styles.networkLogo}
                      />
                      <Text className={styles.podNetwork}>{network}</Text>
                    </HStack>
                  </VStack>
                  <Text className={styles.podLastTransacted}>
                    Last Transacted: {lastTransacted}
                  </Text>
                </VStack>
              </Link>
            )
          )}
        </SimpleGrid>
      </VStack>
    </HStack>
  );
}

export default withTransition(Main);
