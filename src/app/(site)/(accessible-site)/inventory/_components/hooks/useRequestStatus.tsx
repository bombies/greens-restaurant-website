"use client";

import { StockRequestWithOptionalCreatorAndAssignees } from "../requests/inventory-requests-utils";
import { useMemo } from "react";
import { StockRequestStatus } from ".prisma/client";
import { Chip } from "@nextui-org/chip";
import DeliveredIcon from "../../../../../_components/icons/DeliveredIcon";
import DeniedIcon from "../../../../../_components/icons/DeniedIcon";
import PendingIcon from "../../../../../_components/icons/PendingIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import SubTitle from "../../../../../_components/text/SubTitle";
import { Divider } from "@nextui-org/divider";
import clsx from "clsx";

export const getStatusChip = (status?: StockRequestStatus | "EXTRA_DELIVERED") => {
    switch (status) {
        case "EXTRA_DELIVERED": {
            return (
                <Chip
                    variant="flat"
                    color="success"
                    classNames={{
                        content: "font-semibold"
                    }}
                    startContent={<DeliveredIcon width={16} />}
                >
                    EXTRA DELIVERED
                </Chip>
            );
        }
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
};

const useRequestStatus = (request?: StockRequestWithOptionalCreatorAndAssignees) => {
    const chip = useMemo(() => {
        return getStatusChip(request?.status);
    }, [request]);

    return request?.reviewedNotes ? (
        <Popover
            showArrow
            placement="right"
            classNames={{
                base: "bg-neutral-900/80 backdrop-blur-md border-1 border-white/20 p-6"
            }}
        >
            <PopoverTrigger>
                {chip}
            </PopoverTrigger>
            <PopoverContent>
                <SubTitle thick>Notes</SubTitle>
                <Divider className="my-3" />
                {request.reviewedNotes}
            </PopoverContent>
        </Popover>
    ) : chip;
};

export default useRequestStatus;