import Container from "@/app/_components/Container"
import EyeIcon from "@/app/_components/icons/EyeIcon"
import IconButton from "@/app/_components/inputs/IconButton"
import { InventoryWithOptionalExtras } from "@/app/api/inventory/[name]/types"
import { Chip, Divider } from "@nextui-org/react"
import { FC } from "react"

type Props = {
    inventory: InventoryWithOptionalExtras
}

const LowStockWidgetInventorySection: FC<Props> = ({ inventory }) => {
    return (
        <>
            <h3 className="text-lg font-semibold capitalize flex gap-2">
                <span className="self-center">
                    {inventory.name.replaceAll("-", " ")}
                </span>
                <IconButton
                    variant="flat"
                    size="sm"
                    toolTip="View Inventory"
                >
                    <EyeIcon width={16} />
                </IconButton>
            </h3>
            <Divider className="my-3" />
            <Container className="space-y-2 py-2 rounded-xl">
                {inventory.lowStock?.map(stock => (
                    <div
                        key={stock.id}
                        className="grid grid-cols-2"
                    >
                        <p className="break-words capitalize">{stock.name.replaceAll("-", " ")}</p>
                        <Chip
                            variant="flat"
                            size="sm"
                            color={stock.quantity === 0 ? "danger" : "warning"}
                        >
                            {stock.quantity}
                        </Chip>
                    </div>
                ))}
            </Container>
        </>
    )
}

export default LowStockWidgetInventorySection