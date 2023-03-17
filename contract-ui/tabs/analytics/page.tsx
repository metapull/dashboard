import { AnalyticsSectionProps } from "../overview/components/Analytics";
import { EventsFeed } from "./components/events-feed";
import { useEVMContractInfo } from "@3rdweb-sdk/react/hooks/useActiveChainId";
import { ButtonGroup, Flex, SimpleGrid } from "@chakra-ui/react";
import { Chain } from "@thirdweb-dev/chains";
import { AreaChart } from "components/analytics/area-chart";
import { ChartContainer } from "components/analytics/chart-container";
import { InfiniteTransactionsTable } from "components/transactions/infinite-transaction-table";
import {
  useGasAnalytics,
  useTransactionAnalytics,
  useUniqueWalletsAnalytics,
} from "data/api/hooks/analytics";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Heading } from "tw-components";

interface ContractAnalyticsPageProps {
  contractAddress?: string;
}

export const ContractAnalyticsPage: React.FC<ContractAnalyticsPageProps> = ({
  contractAddress,
}) => {
  useEffect(() => {
    window?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const evmContractInfo = useEVMContractInfo();

  const [days, setDays] = useState(90);

  if (!contractAddress) {
    // TODO build a skeleton for this
    return <div>Loading...</div>;
  }

  return (
    <Flex direction="column" gap={6}>
      {contractAddress && evmContractInfo?.chain && (
        <>
          <Flex gap={2} direction="column">
            <Heading as="h2" size="title.md">
              Analytics
            </Heading>
            <ButtonGroup variant="ghost" size="xs">
              <Button isActive={days === 30} onClick={() => setDays(30)}>
                30 days
              </Button>
              <Button isActive={days === 60} onClick={() => setDays(60)}>
                60 days
              </Button>
              <Button isActive={days === 90} onClick={() => setDays(90)}>
                90 days
              </Button>
            </ButtonGroup>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 1 }} gap={4}>
            <Flex flexDir="column" gap={4} as={Card} bg="backgroundHighlight">
              <Heading as="h3" size="subtitle.sm">
                Transactions
              </Heading>
              <ChartContainer w="full" ratio={4.5 / 1}>
                <TransactionsOverTimeChart
                  contractAddress={contractAddress}
                  chain={evmContractInfo.chain}
                  limit={days}
                />
              </ChartContainer>
            </Flex>
            <Flex flexDir="column" gap={4} as={Card} bg="backgroundHighlight">
              <Heading as="h3" size="subtitle.sm">
                Unique Wallets
              </Heading>
              <ChartContainer w="full" ratio={4.5 / 1}>
                <UniqueWalletsOverTimeChart
                  contractAddress={contractAddress}
                  chain={evmContractInfo.chain}
                  limit={days}
                />
              </ChartContainer>
            </Flex>
            <Flex flexDir="column" gap={4} as={Card} bg="backgroundHighlight">
              <Heading as="h3" size="subtitle.sm">
                {evmContractInfo.chain?.nativeCurrency.symbol || "Gas"} Burned
              </Heading>
              <ChartContainer w="full" ratio={4.5 / 1}>
                <GasUsedOverTimeTimeChart
                  contractAddress={contractAddress}
                  chain={evmContractInfo.chain}
                  limit={days}
                />
              </ChartContainer>
            </Flex>
          </SimpleGrid>
          <InfiniteTransactionsTable
            chain={evmContractInfo.chain}
            contractAddress={contractAddress}
          />
        </>
      )}
    </Flex>
  );
};

interface TransactionsOverTimeChartProps extends AnalyticsSectionProps {
  chain: Chain;
  limit: number;
}
const TransactionsOverTimeChart: React.FC<TransactionsOverTimeChartProps> = ({
  chain,
  contractAddress,
  limit,
}) => {
  const transactionAnalyticsQuery = useTransactionAnalytics({
    address: contractAddress,
    chain,
  });

  const data = useMemo(() => {
    if (!transactionAnalyticsQuery.data) {
      return [];
    }
    const currentPeriod = transactionAnalyticsQuery.data?.result.slice(
      0,
      limit,
    );
    const previousPeriod = transactionAnalyticsQuery.data?.result.slice(
      limit,
      limit * 2,
    );
    return currentPeriod.map((current, index) => {
      const previous = previousPeriod[index];
      return {
        timestamp: current.timestamp,
        current: current.count,
        previous: previous?.count,
      };
    });
  }, [transactionAnalyticsQuery.data, limit]);

  return (
    <AreaChart
      data={data}
      index={{ id: "timestamp" }}
      categories={[
        { id: "current", label: "Transactions" },
        {
          id: "previous",
          color: "var(--chakra-colors-accent-300)",
          label: "Previous",
        },
      ]}
      showXAxis
      showYAxis
      startEndOnly
    />
  );
};

interface UniqueWalletsOverTimeChartProps extends AnalyticsSectionProps {
  chain: Chain;
  limit: number;
}
const UniqueWalletsOverTimeChart: React.FC<UniqueWalletsOverTimeChartProps> = ({
  chain,
  contractAddress,
  limit,
}) => {
  const walletAnalyticsQuery = useUniqueWalletsAnalytics({
    address: contractAddress,
    chain,
  });
  return (
    <AreaChart
      data={walletAnalyticsQuery.data?.result.slice(0, limit) || []}
      index={{ id: "timestamp" }}
      categories={[{ id: "count", label: "Unique Wallets" }]}
      showXAxis
      showYAxis
      startEndOnly
    />
  );
};

interface GasUsedOverTimeTimeChartProps extends AnalyticsSectionProps {
  chain: Chain;
  limit: number;
}
const GasUsedOverTimeTimeChart: React.FC<GasUsedOverTimeTimeChartProps> = ({
  chain,
  contractAddress,
  limit,
}) => {
  const gasAnalyticsQuery = useGasAnalytics({
    address: contractAddress,
    chain,
  });
  return (
    <AreaChart
      data={gasAnalyticsQuery.data?.result.slice(0, limit) || []}
      index={{ id: "timestamp" }}
      categories={[
        {
          id: "value",
          label: `${chain.nativeCurrency.symbol || "Gas"} Burned`,
          format: (value: number) => {
            return `${NumberFormatter.format(
              value / 10 ** chain.nativeCurrency.decimals,
            )}`;
          },
        },
      ]}
      showXAxis
      showYAxis
      startEndOnly
    />
  );
};

const NumberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 3,
});
