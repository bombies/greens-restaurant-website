import { FC } from "react";
import GenericEmail, { GenericEmailProps } from "./components/GenericEmail";
import {
    StockRequestWithOptionalExtras
} from "../src/app/(site)/(accessible-site)/inventory/_components/requests/inventory-requests-utils";
import { User } from "@prisma/client";
import { Heading, Hr, Section, Text } from "@react-email/components";

type Props = {
    request: StockRequestWithOptionalExtras,
    assignee: User
} & GenericEmailProps

const InventoryRequestAssignedEmail: FC<Props> = ({
                                                      request = {
                                                          id: "req_id",
                                                          requestedByUser: {
                                                              firstName: "Jane",
                                                              lastName: "Doe"
                                                          },
                                                          requestedItems: [
                                                              {
                                                                  id: "1",
                                                                  amountRequested: 10,
                                                                  stock: {
                                                                      name: "Item 1"
                                                                  }
                                                              },
                                                              {
                                                                  id: "2",
                                                                  amountRequested: 30,
                                                                  stock: {
                                                                      name: "Item 2"
                                                                  }
                                                              },
                                                              {
                                                                  id: "3",
                                                                  amountRequested: 5,
                                                                  stock: {
                                                                      name: "Item 3"
                                                                  }
                                                              }
                                                          ]
                                                      },
                                                      assignee = {
                                                          firstName: "John"
                                                      },
                                                      intendedFor = "jdoe@example.com"
                                                  }) => {
    return (
        <GenericEmail intendedFor={intendedFor}>
            <Heading>
                Hello <span className="text-primary">{assignee.firstName}</span>,
            </Heading>
            <Text>
                You&apos;ve been assigned an inventory request by <span
                className="text-primary">{request.requestedByUser ? `${request.requestedByUser.firstName} ${request.requestedByUser.lastName}` : "Unknown"}</span>
            </Text>
            <Hr className="my-6" />
            <Section className="rounded-3xl border border-solid border-[#eaeaea] p-6 mt-6">
                {request.requestedItems?.map(item => (
                    <Section key={item.id}>
                        <Text className="grid grid-cols-2">
                            <span className="font-semibold">{item.stock?.name}</span>
                            <span
                                className="text-white bg-primary px-3 py-1 rounded-full font-bold w-fit">{item.amountRequested}</span>
                        </Text>
                        <Hr />
                    </Section>
                ))}
            </Section>
            <Hr className="my-6" />
            <Text>
                Please <a href={`https://greensres.ajani.me/inventory/requests/${request.id}`}>review this
                request</a> as soon as possible.
            </Text>
        </GenericEmail>
    );
};

export default InventoryRequestAssignedEmail;