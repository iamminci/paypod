import styles from "@styles/Success.module.css";
import { VStack, Box, Text } from "@chakra-ui/react";
import SuccessLottie from "@components/SuccessLottie";

// type SuccessContainerProps = {
//   type: "crypto" | "nft" | "vault";
//   label: string;
//   pageState?: PageStateType;
// };

const SuccessContainer = () => {
  return (
    <VStack className={styles.detailContainer}>
      <VStack className={styles.sentContainer}>
        <VStack className={styles.sentContainerLottie}>
          <SuccessLottie />
        </VStack>
        <VStack className={styles.sentContainerTextContainer}>
          <Text className={styles.sentContainerTitle}>
            Successfully created!
          </Text>
          <Text className={styles.sentContainerSubtitle}>Demo Pod</Text>
          <Text className={styles.sentContainerFooter}>
            It may take up to ~2 min for the transaction to complete
          </Text>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default SuccessContainer;
