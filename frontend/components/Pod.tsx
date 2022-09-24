import styles from "@styles/Pod.module.css";
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Image,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Spinner,
  Tooltip,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { FaRegPaperPlane, FaBinoculars, FaPause } from "react-icons/fa";
import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import withTransition from "@components/withTransition";
import txnData from "@data/data.json";
import { removeWhitespaceAroundString } from "@utils/helpers";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import { Network, Alchemy } from "alchemy-sdk";
import { useAccount, useProvider } from "wagmi";
import { doc, getDoc } from "firebase/firestore";
import db from "@firebase/firebase";
import { getPodInfo } from "./Main";
import { useRouter } from "next/router";

const tokenData = [
  {
    name: "AVAX",
    symbol: "AVAX",
    fiatBalance: 83.12,
    balance: 4.81,
    iconUrl: "/avax.png",
  },
  {
    name: "PIZZA",
    symbol: "PIZZA",
    fiatBalance: 281.49,
    balance: 2035357.91,
    iconUrl:
      "https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x6121191018BAf067c6Dc6B18D42329447a164F05/logo.png",
  },
];

const settings = {
  apiKey: "ciWZ5nOwLHUnAsHaCH7Flrs4lIfMVABb",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

function Pod() {
  const router = useRouter();
  const contractAddress = router.asPath.split("/")[2];
  const { address } = useAccount();
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<{ [key: string]: any }>({});
  const [transactionsMap, setTransactionsMap] = useState<{
    [key: string]: any;
  }>({});
  const [pod, setPod] = useState<any>([]);
  const provider = useProvider();
  const avaxProvider = useProvider({ chainId: 43114 });
  const fujiProvider = useProvider({ chainId: 43113 });
  const swimmerProvider = useProvider({ chainId: 73772 });
  const dfkProvider = useProvider({ chainId: 53935 });

  useEffect(() => {
    // setIsLoading(true);
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
          if (contractAddress === podAddress) {
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

            const podInfo = await getPodInfo(
              podChainId,
              podAddress,
              podProvider
            );

            setPod(podInfo);
          }
        }
      } else {
        console.log("No such document!");
      }
      // setIsLoading(false);
    }
    fetchPods();
  }, [address]);

  function processTransactions(data: any) {
    const processedTxns: { [key: string]: any } = {};
    const processedTxnsFlat: { [key: string]: any } = {};

    for (let i = 0; i < data.length; i++) {
      const txn = data[i];

      txn.displayAddress = txn.to;

      if (!("timeStamp" in txn)) {
        const time = txn.metadata.blockTimestamp;
        const date = new Date(time);
        const newTimestamp = date.getTime() / 1000;
        txn.timeStamp = newTimestamp;
      }

      let formattedFunctionName = !txn.functionName
        ? "Transfer"
        : txn.functionName;

      const rando = Math.random();
      if (rando < 0.5) {
        formattedFunctionName = "Spend";
        txn.asset = "AXAX";
      } else if (rando < 0.75) {
        formattedFunctionName = "SpendERC20";
        txn.asset = "PIZZA";
      } else {
        formattedFunctionName = "Call";
        txn.asset = "AXAX";
      }

      txn.displayAddress = "0x28a6204E03c43BD4580c3664f7F0B4d862004C96";

      if (!formattedFunctionName.startsWith("Transfer")) {
        const tempName = formattedFunctionName.split("(")[0];
        const tempNameCapitalized =
          tempName.charAt(0).toUpperCase() + tempName.slice(1);
        formattedFunctionName =
          removeWhitespaceAroundString(tempNameCapitalized);
      }

      txn.formattedFunctionName = formattedFunctionName;

      if (typeof txn.value === "string") {
        txn.formattedValue = formatEther(txn.value).toString().substring(0, 5);
      } else if (typeof txn.value === "number") {
        txn.formattedValue = txn.value.toString().substring(0, 5);
      } else {
        txn.formattedValue = 1;
      }

      const date = new Date(txn.timeStamp * 1000);
      const dateStr = date.toDateString();

      const dateArr = dateStr.split(" ");

      const month = dateArr[1];
      const day = dateArr[2];
      const year = dateArr[3];

      const formattedDate = `${month} ${day}, ${year}`;

      const formattedTime = date.toLocaleTimeString();

      txn.formattedDate = formattedDate;
      txn.formattedTime = formattedTime;

      if (processedTxns[formattedDate]) {
        processedTxns[formattedDate].push(txn);
      } else {
        processedTxns[formattedDate] = [txn];
      }
      processedTxnsFlat[txn.hash] = txn;
    }
    setTransactions(processedTxns);
    setTransactionsMap(processedTxnsFlat);
  }

  useEffect(() => {
    async function fetchTokenBalances() {
      const etherBalance = await alchemy.core.getBalance(address as string);
      const { tokenBalances: balances } = await alchemy.core.getTokenBalances(
        address as string,
        "DEFAULT_TOKENS" as any
      );

      const filterWithBalances: any[] = balances.filter(
        (token: any) => Number(token.tokenBalance) > 0
      );

      filterWithBalances.forEach((token) => {
        if (
          token.contractAddress === "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
        ) {
          token.formattedBalance = formatUnits(token.tokenBalance, 6);
        } else {
          token.formattedBalance = formatUnits(token.tokenBalance, 18);
        }
      });

      filterWithBalances.push({
        contractAddress: "",
        tokenBalance: formatEther(etherBalance),
      });

      setTokenBalances(filterWithBalances);
    }
    processTransactions(txnData);
    fetchTokenBalances();
  }, [address]);

  return (
    <HStack className={styles.contentContainer} gap={2}>
      <VStack className={styles.podDetailContainer}>
        <HStack className={styles.podHeaderContainer}>
          <Text className={styles.header}>{pod && pod.name}</Text>
          <HStack className={styles.ctaButtonContainer}>
            <Tooltip label="Deposit" aria-label="A tooltip">
              <Button className={styles.ctaButton} onClick={() => {}}>
                <ArrowUpIcon color="white" w="1.5rem" h="1.5rem" />
              </Button>
            </Tooltip>
            <Tooltip label="Withdraw" aria-label="A tooltip">
              <Button className={styles.ctaButton} onClick={() => {}}>
                <ArrowDownIcon color="white" w="1.5rem" h="1.5rem" />
              </Button>
            </Tooltip>
            <Tooltip label="Transfer Ownership" aria-label="A tooltip">
              <Button className={styles.ctaButton} onClick={() => {}}>
                <FaRegPaperPlane color="white" size="1.5rem" />
              </Button>
            </Tooltip>
            <Tooltip label="Pause" aria-label="A tooltip">
              <Button className={styles.ctaButton} onClick={() => {}}>
                <FaPause color="white" size="1.5rem" />
              </Button>
            </Tooltip>
            <Tooltip label="View on SnowTrace" aria-label="A tooltip">
              <Link
                href={`https://testnet.snowtrace.io`}
                isExternal
                margin="0 !important"
              >
                <Button className={styles.ctaButton}>
                  <FaBinoculars color="white" size="1.5rem" />
                </Button>
              </Link>
            </Tooltip>
          </HStack>
        </HStack>
        <VStack className={styles.balanceContainer}>
          <Text className={styles.tokenBalance}>Token Balance</Text>
          <Text className={styles.fiatBalance}>$0.00</Text>
        </VStack>
        <VStack className={styles.accordianContainer} gap={3}>
          <Accordion
            allowMultiple
            defaultIndex={[0]}
            className={styles.accordion}
          >
            <AccordionItem className={styles.accordionItem}>
              <h2>
                <AccordionButton className={styles.accordionButton}>
                  <HStack flex="1">
                    <Text className={styles.NFTdetailTitle}>Tokens</Text>
                    <Text className={styles.NFTdetailSubtitle}>0</Text>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              {/* <AccordionPanel pb={4}>
                {tokenData.map((token: any, idx: any) => (
                  <HStack key={idx} className={styles.tokenCell}>
                    <HStack className={styles.tokenListCellLeftSection}>
                      <Image
                        src={token.iconUrl}
                        alt={token.name}
                        className={styles.tokenImage}
                      />
                      <Text className={styles.tokenName}>{token.name}</Text>
                    </HStack>
                    <VStack className={styles.tokenListCellRightSection}>
                      <Text className={styles.tokenFiatBalance}>
                        ${token.fiatBalance}
                      </Text>
                      <Text
                        className={styles.tokenCryptoBalance}
                      >{`${token.balance} ${token.symbol}`}</Text>
                    </VStack>
                  </HStack>
                ))}
              </AccordionPanel> */}
            </AccordionItem>
            <AccordionItem className={styles.accordionItem}>
              <h2>
                <AccordionButton className={styles.accordionButton}>
                  <HStack flex="1">
                    <Text className={styles.NFTdetailTitle}>NFTs</Text>
                    <Text className={styles.NFTdetailSubtitle}>0</Text>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              {/* <AccordionPanel pb={4}>
                <SimpleGrid columns={3} spacing={0}>
                  {[
                    {
                      iconUrl: "/pizzeria.png",
                      name: "Pizzeria",
                      collection: "Pizza Game NFT Collection",
                      tokenId: 149,
                    },
                    {
                      iconUrl: "/pizzeria.png",
                      name: "Pizzeria",
                      collection: "Pizza Game NFT Collection",
                      tokenId: 910,
                    },
                    {
                      iconUrl: "/pizzeria.png",
                      name: "Pizzeria",
                      collection: "Pizza Game NFT Collection",
                      tokenId: 849,
                    },
                  ].map((nft: any, idx: any) => (
                    <VStack key={idx} className={styles.VaultNFTListCell}>
                      <Image
                        src={nft.iconUrl}
                        alt={nft.name}
                        className={styles.NFTImage}
                      />
                      <VStack className={styles.NFTListCellNameContainer}>
                        <Text className={styles.NFTName}>{nft.name}</Text>
                        <Text className={styles.NFTCollectionName}>
                          {nft.collection}
                        </Text>
                      </VStack>
                      <VStack className={styles.NFTListCellFooter}>
                        <Text
                          className={styles.NFTTokenID}
                        >{`ID: ${nft.tokenId}`}</Text>
                      </VStack>
                    </VStack>
                  ))}
                </SimpleGrid>
              </AccordionPanel> */}
            </AccordionItem>

            <AccordionItem className={styles.accordionItem}>
              <h2>
                <AccordionButton className={styles.accordionButton}>
                  <HStack flex="1">
                    <Text className={styles.NFTdetailTitle}>Controllers</Text>
                    <Text className={styles.NFTdetailSubtitle}>0</Text>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              {/* <AccordionPanel pb={4}>
                {[
                  { address: "0x28a6204E03c43BD4580c3664f7F0B4d862004C96" },
                ].map((permission, idx) => (
                  <HStack
                    key={idx}
                    className={styles.vaultPermissionsContainer}
                  >
                    <HStack>
                      <Text className={styles.vaultPermissionTitle}>
                        {abridgeAddress(permission.address)}
                      </Text>
                      <Button className={styles.vaultPermissionButton}>
                        Revoke
                      </Button>
                    </HStack>
                    <Text className={styles.vaultPermissionSubtitle}>
                      CALL, SPEND
                    </Text>
                  </HStack>
                ))}
              </AccordionPanel> */}
            </AccordionItem>
          </Accordion>
        </VStack>
      </VStack>
      <Box w="2rem"></Box>
      <VStack className={styles.txnContainer}>
        <HStack className={styles.txnHeaderContainer}>
          <Text className={styles.header}>Transactions</Text>
          {/* <Tooltip label="Report Abnormal Activity" aria-label="A tooltip">
            <Button className={styles.reportButton}>Report</Button>
          </Tooltip> */}
        </HStack>
        {
          <VStack w="100%" height="600px" paddingTop="30%">
            <Text>This pod has no transactions yet.</Text>
          </VStack>
        }
        {/* {<Box className={styles.tableContainer}>
          <TableContainer>
            <Table variant="unstyled">
              <Thead>
                <Tr className={styles.transactionHeaderContainer}>
                  <Th></Th>
                  <Th className={styles.transactionHeaderLabel}>Time</Th>
                  <Th className={styles.transactionHeaderLabel}>Method</Th>
                  <Th className={styles.transactionHeaderLabel}>Value</Th>
                  <Th className={styles.transactionHeaderLabel}>Controller</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.keys(transactions).map((key) =>
                  transactions[key]
                    .sort((a: any, b: any) => b.timeStamp - a.timeStamp)
                    .map(
                      (
                        {
                          formattedDate,
                          formattedTime,
                          formattedFunctionName,
                          displayAddress,
                          displayName,
                          formattedValue,
                          hash,
                          asset,
                          txreceipt_status,
                        }: any,
                        idx: number
                      ) => (
                        <Tr
                          key={hash}
                          onClick={() => {}}
                          className={styles.transactionRowContainer}
                        >
                          <Td className={styles.tableDateCell}>
                            {idx === 0 ? formattedDate : ""}
                          </Td>
                          <Td className={styles.tableCell}>{formattedTime}</Td>
                          <Td className={styles.tableCell}>
                            {abridgeMethod(formattedFunctionName)}
                          </Td>
                          <Td className={styles.tableCell}>
                            -${formattedValue} {asset ?? "AVAX"}
                          </Td>
                          <Tooltip
                            label={displayName ?? displayAddress}
                            aria-label="A tooltip"
                          >
                            <Td className={styles.tableCell}>
                              {abridgeAddress(displayAddress)}
                            </Td>
                          </Tooltip>
                        </Tr>
                      )
                    )
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>} */}
      </VStack>
    </HStack>
  );
}

export default withTransition(Pod);
