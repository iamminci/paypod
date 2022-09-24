import styles from "@styles/Main.module.css";
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Image,
  Spinner,
} from "@chakra-ui/react";
import withTransition from "@components/withTransition";
import { useAccount, useBalance, useProvider } from "wagmi";
import { SimpleGrid } from "@chakra-ui/react";
import PieChart from "@components/PieChart";
import Gradient from "javascript-color-gradient";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import Create from "@components/Create";
import Pod from "@components/Pod";
import { abridgeLabel } from "@utils/helpers";
import { doc, getDoc } from "firebase/firestore";
import db from "@firebase/firebase";
import { ethers } from "ethers";
import Paypod from "@data/PayPod.json";

const gradientArray = new Gradient()
  .setColorGradient("#ff3131", "#ffb9b9")
  .getColors();

export function getChainInfo(chainId: number) {
  switch (chainId) {
    case 43114:
      return {
        name: "Avalanche C-Chain",
        logo: "/avax.png",
      };
    case 43113:
      return {
        name: "Fuji Testnet",
        logo: "/avax.png",
      };
    case 73772:
      return {
        name: "Swimmer Network",
        logo: "/swimmer.png",
      };
    case 53935:
      return {
        name: "DFK Subnet",
        logo: "/dfk.png",
      };
    default:
      return {
        name: "Unknown",
        logo: "/unknown.png",
      };
  }
}

export async function getPodInfo(
  chainId: number,
  address: string,
  provider: any
) {
  const podContract = new ethers.Contract(address, Paypod.abi, provider);

  const podName = await podContract.name();
  const podBalance = await provider.getBalance(address);

  return {
    address: address,
    name: podName,
    balance: podBalance,
    formattedBalance: ethers.utils.formatEther(podBalance),
    chainId: chainId,
    networkName: getChainInfo(chainId).name,
    networkLogo: getChainInfo(chainId).logo,
  };
}

function Main() {
  const router = useRouter();
  const { address } = useAccount();

  if (!address) return <></>;

  function getContent() {
    const path = router.asPath.split("/")[1];
    switch (path) {
      case "#create":
        return <Create />;
      case "#pod":
        return <Pod />;
      default:
        return <Overview address={address!} />;
    }
  }

  return <div className={styles.container}>{getContent()}</div>;
}

type OverviewProps = {
  address: string;
};

function Overview({ address }: OverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [balances, setBalances] = useState<any>([]);
  const [pods, setPods] = useState<any>([]);
  const provider = useProvider();
  const avaxProvider = useProvider({ chainId: 43114 });
  const fujiProvider = useProvider({ chainId: 43113 });
  const swimmerProvider = useProvider({ chainId: 73772 });
  const dfkProvider = useProvider({ chainId: 53935 });

  useEffect(() => {
    setIsLoading(true);
    async function fetchBalances() {
      const avaxBalance = await avaxProvider.getBalance(address);
      const fujiBalance = await fujiProvider.getBalance(address);
      const swimmerBalance = await swimmerProvider.getBalance(address);
      const dfkBalance = await dfkProvider.getBalance(address);
      const tempBalances = [];
      tempBalances.push({
        id: 0,
        label: "AVAX",
        value: ethers.utils.formatEther(avaxBalance),
        network: "Avalanche C-Chain",
        networkLogo: "/avax.png",
        lastTransacted: "--",
        color: gradientArray[0],
      });
      tempBalances.push({
        id: 1,
        label: "FUJI",
        value: ethers.utils.formatEther(fujiBalance),
        network: "Fuji Testnet",
        networkLogo: "/avax.png",
        lastTransacted: "--",
        color: gradientArray[1],
      });
      tempBalances.push({
        id: 2,
        label: "SWIM",
        value: ethers.utils.formatEther(swimmerBalance),
        network: "Swimmer Network",
        networkLogo: "/swimmer.png",
        lastTransacted: "--",
        color: gradientArray[2],
      });
      tempBalances.push({
        id: 3,
        label: "DFK",
        value: ethers.utils.formatEther(dfkBalance),
        network: "DFK Subnet",
        networkLogo: "/dfk.png",
        lastTransacted: "--",
        color: gradientArray[3],
      });
      setBalances(tempBalances);
    }

    async function fetchPods() {
      const tempPods = [];
      if (!address) return;
      const docRef = doc(db, "addresses", address);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const { pods: fetchedPods } = data;

        for (let i = 0; i < fetchedPods.length; i++) {
          const podAddress = fetchedPods[i].address;
          const podChainId = fetchedPods[i].network;

          let podProvider;

          switch (podChainId) {
            case 43114:
              podProvider = avaxProvider;
              break;
            case 43113:
              podProvider = fujiProvider;
              break;
            case 73772:
              podProvider = swimmerProvider;
              break;
            case 53935:
              podProvider = dfkProvider;
              break;
            default:
              podProvider = provider;
              break;
          }

          const podInfo = await getPodInfo(podChainId, podAddress, podProvider);

          tempPods.push(podInfo);
        }

        setPods(tempPods);
      } else {
        console.log("No such document!");
      }
      setIsLoading(false);
    }
    fetchPods();
    fetchBalances();
  }, [address]);

  const chartData = balances
    .filter((balance: any) => Number(balance.value) > 0)
    .map((token: any, idx: number) => {
      return {
        label: abridgeLabel(token.label),
        value: Number(token.value),
        color: gradientArray[token.id],
      };
    });

  const aggregatedBalance = balances.reduce(
    (acc: any, token: any) => acc + parseFloat(token.value),
    0
  );

  return (
    <HStack className={styles.contentContainer} gap={2}>
      <VStack className={styles.overviewContainer}>
        <Text className={styles.header}>Overview</Text>
        <Text className={styles.balanceHeader}>Your Total Balance</Text>
        <Text className={styles.fiatBalance}>
          {aggregatedBalance.toFixed(2)} AVAX
        </Text>
        {aggregatedBalance > 0 && (
          <VStack>
            <Box className={styles.pieChartContainer}>
              {chartData.length > 0 && <PieChart data={chartData} />}
            </Box>
            <VStack className={styles.scoreListContainer}>
              {balances.map(({ label, value, color }: any, idx: number) => (
                <HStack key={idx} className={styles.scoreContainer}>
                  <Text className={styles.scoreTitleLabel}>{label}</Text>
                  <Box className={`${styles.scoreBarContainer}`}>
                    <Box
                      style={{
                        backgroundColor: color,
                        width: `${((value / aggregatedBalance) * 100).toFixed(
                          0
                        )}%`,
                      }}
                      className={`${styles.scoreBar}`}
                    ></Box>
                  </Box>
                  <Text className={styles.scoreLabel}>
                    {((value / aggregatedBalance) * 100).toFixed(0)}%
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        )}
      </VStack>
      <Box w="2rem"></Box>
      <VStack className={styles.podContainer}>
        <HStack className={styles.podHeaderContainer}>
          <Text className={styles.header}>Pods</Text>
          <Link href="/#create">
            <Button className={styles.createPod}>+ Create Pod</Button>
          </Link>
        </HStack>
        {isLoading ? (
          <VStack w="100%" height="600px" paddingTop="30%">
            <Spinner />
          </VStack>
        ) : pods.length > 0 ? (
          <SimpleGrid columns={3} gap={6} className={styles.podGrid}>
            {pods.map(
              ({
                address,
                name,
                formattedBalance,
                networkName,
                networkLogo,
              }: any) => (
                <Link key={name} href={`/#pod/${address}`}>
                  <VStack className={styles.pod}>
                    <VStack className={styles.podTopSection}>
                      <Text className={styles.podTitle}>{name}</Text>
                      <Text className={styles.podBalance}>
                        ${formattedBalance}
                      </Text>
                      <HStack>
                        <Image
                          src={networkLogo}
                          alt={name}
                          className={styles.networkLogo}
                        />
                        <Text className={styles.podNetwork}>{networkName}</Text>
                      </HStack>
                    </VStack>
                    <Text className={styles.podLastTransacted}>
                      Last Transacted: --
                    </Text>
                  </VStack>
                </Link>
              )
            )}
          </SimpleGrid>
        ) : (
          <VStack w="100%" height="600px" paddingTop="30%">
            <Text>You do not own any pods.</Text>
          </VStack>
        )}
      </VStack>
    </HStack>
  );
}

export default withTransition(Main);
