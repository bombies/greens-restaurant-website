import Link from "next/link";
import { StockItem } from "../../types/InventoryCategoryObject";
import GenericWidget from "./GenericWidget";

type Props = {
    stockInfo?: { id: string; name: string; stock: StockItem[] }[] | [];
};

const LowStockWidget = (props: Props) => {
    const generateClickabes = () => {
        return props.stockInfo?.map((obj) => {
            const items = obj.stock.map((e) => (
                <div key={e.uid}>
                    <p>{`${e.name} (${e.quantity} in stock)`}</p>
                </div>
            ));

            return (
                <div key={obj.id} className="cursor-pointer">
                    <Link href={`/inventory/${obj.id}`}>
                        <div className="mr-4">
                            <div className="bg-green-400 dark:bg-green-500 py-1 px-3 rounded-t-md">
                                <p className="text-white text-lg tracking-wider">
                                    {obj.name}
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-200 py-1 px-3">
                                {items}
                            </div>
                            <hr className="my-2 transition-medium dark:opacity-10" />
                        </div>
                    </Link>
                </div>
            );
        });
    };

    return (
        <GenericWidget title="Low Stock">
            {props.stockInfo?.length === 0 ? (
                <div className="items-center h-full flex justify-center">
                    <p className="text-3xl text-neutral-300 dark:text-neutral-600 pointer-events-none">
                        All stocks are good!
                    </p>
                </div>
            ) : (
                <div className="overflow-y-auto h-3/4 scroll-m-6">
                    {generateClickabes()}
                </div>
            )}
        </GenericWidget>
    );
};

export default LowStockWidget;
