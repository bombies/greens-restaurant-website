"use client";

import React, { useEffect, useRef, useState } from "react";
import { StaticImageData } from "next/image";
import dropDownIcon from "/public/icons/drop-down.svg";
import GenericImage from "../GenericImage";
import ComponentSize from "../ComponentSize";
import clsx from "clsx";
import GenericInput from "./GenericInput";

export type SelectMenuContent = {
    label: string,
    value: string,
    icon?: string | StaticImageData,
    category?: string,
    selected?: boolean,
}

interface Props {
    id: string,
    content?: SelectMenuContent[],
    placeholder?: string,
    size?: ComponentSize,
    fullWidth?: boolean,
    multiSelect?: boolean,
    displayCategories?: boolean
    noDeselect?: boolean,
    onItemSelect?: (item: SelectMenuContent) => void;
    handleItemSelect?: (item: SelectMenuContent) => void;
    handleItemDeselect?: (item: SelectMenuContent) => void;
    disabled?: boolean;
}

const parseMenuSize = (size?: ComponentSize) => {
    switch (size) {
        case "xs":
            return "w-[15rem] tablet:w-[10rem]";
        case "sm":
            return "w-[20rem] tablet:w-[15rem]";
        case "md":
            return "w-[25rem] tablet:w-[20rem]";
        case "lg":
            return "w-[30rem] tablet:w-[25rem]";
        case "xl":
            return "w-[40rem] tablet:w-[35rem] phone:w-[30rem]";
        default:
            return "w-[15rem] tablet:w-[10rem]";
    }
};

const parseCategories = (content?: SelectMenuContent[]): { category?: string, items: SelectMenuContent[] }[] => {
    if (!content)
        return [];

    const categories = content.map(item => item.category)
        .filter((val, i, arr) => arr.indexOf(val) === i)
        .map(category => {
            return {
                category: category,
                items: content.filter(item => item.category === category)
            };
        });
    categories.forEach(category => category.items.sort((a, b) => a.label.localeCompare(b.label)));
    return categories;
};

const generateCategoryElement = (
    key: string,
    content: { category?: string, items: SelectMenuContent[] },
    handleSelect: (val: SelectMenuContent) => void,
    selectedItems?: SelectMenuContent[],
    displayCategories?: boolean,
    onItemSelect?: (item: SelectMenuContent) => void
) => {
    const isItemSelected = (item: SelectMenuContent) => {
        return selectedItems ? selectedItems.filter(i => i.value === item.value).length > 0 : false;
    };

    const itemElements = content.items.map((item, i) => {
        return (
            <div
                key={`${content.category || i}#${item.label}#${item.value}`}
                className="flex gap-4 cursor-pointer"
                onClick={() => {
                    handleSelect(item);
                    if (onItemSelect)
                        onItemSelect(item);
                }}
            >
                {
                    item.icon && <GenericImage src={item.icon} width={1} className="self-center" />
                }
                <p className={"text-gray-300 hover:!text-primary transition-fast select-none whitespace-nowrap overflow-hidden text-ellipsis" + (isItemSelected(item) ? " !text-primary" : "")}>{item.label}</p>
            </div>
        );
    });

    return (
        <div key={key}>
            {displayCategories !== false &&
                <h4 className="dark:text-neutral-600 text-neutral-700 text-center uppercase font-semibold text-sm my-3 select-none whitespace-nowrap overflow-hidden text-ellipsis">{content.category || "No Category"}</h4>}
            {itemElements}
        </div>
    );
};

export default function SelectMenu(props: Props) {
    const [expanded, setExpanded] = useState(false);
    const [selected, setSelected] = useState<SelectMenuContent[] | undefined>(props.content?.filter(item => item.selected === true));
    const [searchValue, setSearchValue] = useState("");
    const [visibleItems, setVisibleItems] = useState(parseCategories(props.content));

    useEffect(() => {
        setVisibleItems(searchValue === "" ? parseCategories(props.content) : parseCategories(props.content?.filter(item => item.label.toLowerCase().includes(searchValue.trim()))));
    }, [props.content, searchValue, setVisibleItems]);

    const toggleExpanded = () => {
        if (props.disabled)
            return;
        setExpanded(prev => !prev);
    };

    const handleSelect = (value: SelectMenuContent) => {
        if (props.disabled)
            return;
        if (!expanded)
            return;

        setSelected(prev => {
            if (!prev || prev.length === 0) {
                if (props.handleItemSelect)
                    props.handleItemSelect(value);
                return [value];
            }

            if (typeof props.multiSelect !== "undefined" && prev.filter(item => item.value === value.value).length > 0) {
                if (props.handleItemDeselect)
                    props.handleItemDeselect(value);
                return prev.filter(item => item.value !== value.value);
            } else if (typeof props.multiSelect !== "undefined") {
                if (props.handleItemSelect)
                    props.handleItemSelect(value);
                return [...prev, value];
            } else {
                if (typeof props.noDeselect !== "undefined" && value === prev[0])
                    return [prev[0]];
                if (props.handleItemDeselect)
                    props.handleItemDeselect(prev[0]);
                if (props.handleItemSelect)
                    props.handleItemSelect(value);
                return [value];
            }
        });
    };

    const categories = visibleItems.map((category, i) =>
        generateCategoryElement(
            category.category ? `select_category:${category.category}` : `select_category:${i}`,
            category,
            handleSelect,
            selected,
            props.displayCategories
        )
    );

    const wrapperRef = useRef<any>(null);
    const optionsViewRef = useRef<any>(null);

    useEffect(() => {
        const handle = (event: MouseEvent) => {
            if (wrapperRef.current && (!wrapperRef.current?.contains(event.target) && !optionsViewRef.current?.contains(event.target))) {
                setExpanded(false);
            }
        };

        document.addEventListener("mousedown", handle);
        return () => {
            document.removeEventListener("mousedown", handle);
        };
    }, [wrapperRef, optionsViewRef]);

    return (
        <div
            className={clsx(
                "relative",
                parseMenuSize(props.size),
                props.fullWidth && "!w-full"
            )}
        >
            <div
                ref={wrapperRef}
                onClick={toggleExpanded}
                className={clsx("flex justify-between cursor-pointer p-3 bg-neutral-900 rounded-xl shadow-md", props.disabled && "brightness-50")}
            >
                <p unselectable="on"
                   className="text-neutral-700 select-none whitespace-nowrap overflow-hidden text-ellipsis"
                >
                    {selected ? (selected.length > 0 ? selected.map(item => item.label).toLocaleString() : (props.placeholder || "")) : (props.placeholder || "")}
                </p>
                <GenericImage
                    className={"self-center relative transition-fast select-none " + (expanded ? "rotate-180" : "")}
                    src={dropDownIcon}
                    width={1.5}
                />
            </div>
            <div
                className={"absolute z-50 left-0 mt-4 transition-faster " + (expanded ? "opacity-100" : "opacity-0 pointer-events-none")}
                ref={optionsViewRef}
            >
                <GenericInput
                    id={`select_menu_search:${props.id}`}
                    placeholder="Search..."
                    value={searchValue}
                    onChange={e => {
                        if (!expanded)
                            return;
                        setSearchValue(e.target.value);
                    }}
                />
                <div
                    className={" max-h-48 overflow-auto p-4 bg-neutral-900 rounded-xl shadow-md transition-faster " + parseMenuSize(props.size)}>
                    {categories.length !== 0 ? categories :
                        <p className="text-neutral-700 select-none">There are no items...</p>}
                </div>
            </div>
        </div>
    );
}