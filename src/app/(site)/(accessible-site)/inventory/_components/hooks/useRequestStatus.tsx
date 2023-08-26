"use client";

import { StockRequestWithOptionalCreatorAndAssignees } from "../requests/inventory-requests-utils";
import { useMemo } from "react";
import { StockRequestStatus } from ".prisma/client";
import { Chip } from "@nextui-org/chip";
import DeliveredIcon from "../../../../../_components/icons/DeliveredIcon";
import DeniedIcon from "../../../../../_components/icons/DeniedIcon";
import PendingIcon from "../../../../../_components/icons/PendingIcon";

const useRequestStatus = (request?: StockRequestWithOptionalCreatorAndAssignees) => {
    return useMemo(() => {
        switch (request?.status) {
            case StockRequestStatus.DELIVERED: {
                return (
                    <Chip
                        variant="flat"
                        color="success"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<DeliveredIcon width={16} />}
                    >
                        DELIVERED
                    </Chip>
                );
            }
            case StockRequestStatus.PARTIALLY_DELIVERED: {
                return (
                    <Chip
                        variant="flat"
                        color="warning"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<DeliveredIcon width={16} />}
                    >
                        PARTIALLY DELIVERED
                    </Chip>
                );
            }
            case StockRequestStatus.REJECTED: {
                return (
                    <Chip
                        variant="flat"
                        color="danger"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<DeniedIcon width={16} />}
                    >
                        REJECTED
                    </Chip>
                );
            }
            case StockRequestStatus.PENDING: {
                return (
                    <Chip
                        variant="flat"
                        classNames={{
                            content: "font-semibold"
                        }}
                        startContent={<PendingIcon width={16} />}
                    >
                        PENDING
                    </Chip>
                );
            }
        }
    }, [request?.status]);
};

export default useRequestStatus;