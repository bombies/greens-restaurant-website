import Link from "next/link";

type Props = {
    name: string,
    uid: string
}

const CategoryCard = (props: Props) => {
    return (
        <Link href={`/inventory/${props.uid}`}>
            <div className='w-72 h-12 flex items-center justify-center bg-white rounded-xl shadow-md transition-fast hover:scale-105 border-opacity-10 border-2 border-green-400 hover:border-opacity-100'>
                <p className='text-xl tracking-wider text-center overflow-hidden overflow-ellipsis pointer-events-none'>{props.name}</p>
            </div>
        </Link>
    )
};

export default CategoryCard;