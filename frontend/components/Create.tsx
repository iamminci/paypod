import styles from "@styles/Create.module.css";
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
import Link from "next/link";
import { useEffect, useState } from "react";
import withTransition from "@components/withTransition";
import { useNetwork, useSigner, useSwitchNetwork } from "wagmi";
import { ethers } from "ethers";
import Paypod from "@data/PayPod.json";
import SuccessContainer from "./Success";
import { useRouter } from "next/router";

const networks = [
  {
    name: "Avalanche C-Chain",
    chainId: 43114,
  },
  {
    name: "Fuji Testnet",
    chainId: 43113,
  },
  {
    name: "Swimmer Network",
  },
  {
    name: "DFK Subnet",
  },
  {
    name: "Custom",
  },
];

function Create() {
  const { data: signer, isError } = useSigner();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState(43114);
  const [controllers, setControllers] = useState([]);
  const [limitTokenAddresses, setLimitTokenAddresses] = useState([]);
  const [spendLimits, setSpendLimits] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { isLoading: isSwitchNetworkLoading, switchNetwork } =
    useSwitchNetwork();

  function handleNetworkChange(e: any) {
    switchNetwork?.(Number(e.target.value));
  }

  async function deployContract() {
    if (!signer) return;
    setIsLoading(true);

    try {
      const contractFactory = new ethers.ContractFactory(
        Paypod.abi,
        Paypod.bytecode,
        signer
      );

      const contract = await contractFactory.deploy(
        controllers,
        limitTokenAddresses,
        spendLimits,
        0
      );

      console.log("contrat deployed");
      console.log("contract: ", contract);
      console.log("contract address: ", contract.address);
      handleSuccess();

      // setPublishedContract(contract.address);
      // saveContract(contract.address, imageURI);
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  }

  function handleSuccess() {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      router.push("/");
    }, 3000);
  }

  return (
    <HStack className={styles.contentContainer} gap={2}>
      {isSuccess ? (
        <SuccessContainer />
      ) : (
        <VStack className={styles.createPodContainer}>
          <Text className={styles.createPodHeader}>Create a Pod</Text>
          <VStack className={styles.inputContainer}>
            <Text className={styles.inputHeader}>Pod Name</Text>
            <Input placeholder="Enter pod name" className={styles.input} />
          </VStack>
          <VStack className={styles.inputContainer}>
            <Text className={styles.inputHeader}>Network</Text>
            <Select
              className={styles.select}
              onChange={(e) => handleNetworkChange(e)}
              defaultValue={networks[0].name}
            >
              {networks.map((option: any, idx: any) => (
                <option key={idx} value={option.chainId}>
                  {option.name}
                </option>
              ))}
            </Select>
          </VStack>
          <VStack className={styles.inputContainer}>
            <Text className={styles.inputHeader}>Controller Address</Text>
            <Input
              placeholder="Enter controller address"
              className={styles.input}
            />
            <Text className={styles.inputSubheader}>+ Add New Controller</Text>
          </VStack>
          <VStack className={styles.inputContainer}>
            <Text className={styles.inputHeader}>
              Max Spend Limit (optional)
            </Text>
            <HStack w="100%">
              <Input
                placeholder="Enter token address"
                className={styles.input}
              />
              <Input placeholder="Enter spend limit" className={styles.input} />
            </HStack>
            <Text className={styles.inputSubheader}>+ Add New Spend Limit</Text>
          </VStack>
          <VStack className={styles.inputContainer}>
            <Text className={styles.inputHeader}>
              Expiration Date (optional)
            </Text>
            <Input
              placeholder="Enter expiration date (e.g. 09-09-2023)"
              className={styles.input}
            />
          </VStack>
          <HStack className={styles.switchContainer}>
            <Switch
              colorScheme="red"
              onChange={() => {}}
              className={styles.switch}
            />
            <Text className={styles.switchDescription}>
              I acknowledge that controller addresses have full access to the
              funds held in the pod and that it is my responsibility to monitor
              and report any abnormal transaction behaviors.
            </Text>
          </HStack>
          <HStack className={styles.buttonContainer}>
            <Link href="/">
              <Button className={styles.cancelButton} onClick={() => {}}>
                Cancel
              </Button>
            </Link>
            <Button className={styles.createButton} onClick={deployContract}>
              {isLoading ? <Spinner color="white" /> : "Create"}
            </Button>
          </HStack>
        </VStack>
      )}
      <Box w="2rem"></Box>
      <VStack className={styles.podContainer}>
        <HStack className={styles.podHeaderContainer}>
          <Text className={styles.header}>What is a pod?</Text>
        </HStack>
        <VStack className={styles.whatIsPodContainer}>
          <Text className={styles.whatIsPodText}>
            A pod is a smart contract wallet that provides account abstraction
            for web3 game players to enhance their gaming experience.
          </Text>
          <Text className={styles.whatIsPodText}>
            Like a prepaid card, users can deposit funds into a pod for a
            specific game, then assign controllers to the pod. Controllers will
            have the abillty to:
          </Text>
          <Text className={styles.whatIsPodText}>
            1. Spend funds in your pod (e.g. pay fees, make in-game purchases)
          </Text>
          <Text className={styles.whatIsPodText}>
            2. Execute smart contract calls on behalf of your pod (e.g. update
            an on-chain game state)
          </Text>
          <Image
            src="diagram.png"
            alt="diagram"
            className={styles.diagram}
          ></Image>
          <Text className={styles.whatIsPodText}>
            A pod can be deployed on Avalanche C-Chain or any EVM-compatible
            Avalanche subnet.{" "}
          </Text>
        </VStack>
      </VStack>
    </HStack>
  );
}

export default withTransition(Create);
