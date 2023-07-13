"use client";

import { useEffect, useState } from "react";
import GenericInput from "../../../../_components/inputs/GenericInput";
import searchIcon from "/public/icons/search.svg";
import { Spacer } from "@nextui-org/react";
import useSWR from "swr";
import { User } from "@prisma/client";
import axios from "axios";
import EmployeeCard from "./EmployeeCard";
import EmployeeCardSkeleton from "./EmployeeCardSkeleton";
import { useSession } from "next-auth/react";

export async function fetcher<T>(url: string): Promise<T | undefined> {
    try {
        return (await axios.get(url)).data;
    } catch (e) {
        // console.error(e);
        throw e;
    }
}

export interface SWRArgs {
    arg: any;
}

const useEmployeeInfo = () => {
    return useSWR("/api/users", fetcher<User[]>);
};

const extractValidEmployees = (users: User[], selfUsername?: string) => {
    return selfUsername === "root" ?
        users
        :
        users.filter(info => info.username !== "root");
};

export default function EmployeeGrid() {
    const session = useSession();
    const [search, setSearch] = useState("");
    const { data: employeeInfo, error: employeeError, isLoading: employeesLoading } = useEmployeeInfo();
    const [visibleEmployees, setVisibleEmployees] = useState<User[]>([]);

    useEffect(() => {
        if (!employeesLoading && employeeInfo) {
            setVisibleEmployees(extractValidEmployees(employeeInfo, session.data?.user?.username));
        }
    }, [employeeInfo, employeesLoading, session.data?.user?.username]);

    useEffect(() => {
        if (employeeInfo == null)
            return;

        const validEmployees = extractValidEmployees(employeeInfo, session.data?.user?.username);

        if (search.length === 0) {
            setVisibleEmployees(validEmployees);
            return;
        }

        const results = validEmployees.filter(employee => {
            const employeeName = `${employee.firstName.toLowerCase()} ${employee.lastName.toLowerCase()}`;
            return employeeName.includes(search.toLowerCase().trim()) || employee.username.includes(search.toLowerCase().trim());
        });

        setVisibleEmployees(results);
    }, [employeeInfo, search, session.data?.user?.username]);

    const employeeCards = visibleEmployees.map(employee =>
        <EmployeeCard key={`employee:${employee.username}`} user={employee} />
    );

    return (
        <div>
            <Spacer y={6} />
            <div className="w-[24rem] tablet:w-full">
                <GenericInput
                    id="employee_search"
                    size="md"
                    iconLeft={searchIcon}
                    placeholder="Search for an employee..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <Spacer y={12} />
            <div className="grid grid-cols-3 tablet:grid-cols-2 phone:grid-cols-1 gap-6">
                {
                    employeesLoading ?
                        <>
                            <EmployeeCardSkeleton />
                            <EmployeeCardSkeleton />
                            <EmployeeCardSkeleton />
                            <EmployeeCardSkeleton />
                            <EmployeeCardSkeleton />
                            <EmployeeCardSkeleton />
                            <EmployeeCardSkeleton />
                            <EmployeeCardSkeleton />
                            <EmployeeCardSkeleton />
                        </>
                        :
                        employeeCards.length == 0 ?
                            <p className="default-container p-6">No employees found...</p>
                            :
                            employeeCards
                }
            </div>
        </div>
    );
}