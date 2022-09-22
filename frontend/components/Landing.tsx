import styles from "../styles/Landing.module.css";
import { VStack, Text } from "@chakra-ui/react";
import withTransition from "@components/withTransition";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Landing = () => {
  return (
    <VStack>
      <Text className={styles.title}>Welcome to PayPod</Text>
      <Text className={styles.subtitle}>
        Connect your wallet to get started.
      </Text>
      <ConnectButton />
    </VStack>
  );
};

export default withTransition(Landing);
