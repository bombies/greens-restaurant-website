import Container from "@/app/_components/Container"
import EyeIcon from "@/app/_components/icons/EyeIcon"
import IconButton from "@/app/_components/inputs/IconButton"
import { InventoryWithOptionalExtras } from "@/app/api/inventory/[name]/types"
import { Chip, Divider } from "@nextui-org/react"
import { FC, Fragment } from "react"

type Props = {
    inventory: InventoryWithOptionalExtras
}

const LowStockWidgetInventorySection: FC<Props> = ({ inventory }) => {
    return (
        <>
            <IconButton
                variant="flat"
                size="sm"
                toolTip="View Inventory"
                href={`/inventory/${inventory.name}`}
            >
                <EyeIcon width={16} />
            </IconButton>
            <Divider className="my-3" />
            <div className="grid grid-cols-[minmax(0,_3fr)_minmax(0,_1fr)] gap-y-2">
                {inventory.lowStock?.map(stock => (
                    <Fragment key={stock.id}>
                        <p className="break-words capitalize">{stock.name.replaceAll("-", " ")}</p>
                        <Chip
                            variant="flat"
                            size="sm"
                            color={stock.quantity === 0 ? "danger" : "warning"}
                        >
                            {stock.quantity}
                        </Chip>
                    </Fragment>
                ))}
            </div>
        </>
    )
}

export default LowStockWidgetInventorySection