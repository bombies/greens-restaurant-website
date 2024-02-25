"use client";

import { Dispatch, FC, SetStateAction, useCallback, useState } from "react";
import GenericTextArea from "../../../../../../_components/inputs/GenericTextArea";
import { Divider } from "@nextui-org/divider";
import GenericCard from "../../../../../../_components/GenericCard";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import GenericModal from "../../../../../../_components/GenericModal";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { toast } from "react-hot-toast";
import { KeyedMutator } from "swr";
import { ReviewInventoryRequestDto, StockRequestWithOptionalExtras } from "../../../../../../api/inventory/requests/types";
import { GenericDatePicker } from "app/_components/GenericDatePicker";

type ReviewRequestArgs = {
    arg: {
        dto: ReviewInventoryRequestDto
    }
}

const ReviewRequest = (id: string) => {
    const mutator = (url: string, { arg }: ReviewRequestArgs) => axios.post(url, arg.dto);
    return useSWRMutation(`/api/inventory/requests/${id}/review`, mutator);
};

type Props = {
    id: string,
    optimisticRequest: ReviewInventoryRequestDto,
    mutate: KeyedMutator<StockRequestWithOptionalExtras | undefined>,
    onReview?: () => void,
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}

type FormProps = {
    review_notes?: string,
}

const ConfirmInventoryRequestReviewModal: FC<Props> = ({ id, optimisticRequest, mutate, onReview, isOpen, setOpen }) => {
    const { register, handleSubmit } = useForm<FormProps>();
    const { trigger: triggerRequestReview, isMutating: isReviewing } = ReviewRequest(id);
    const [dateDelivered, setDateDelivered] = useState<Date>();

    const onSubmit: SubmitHandler<FormProps> = useCallback(async (data) => {
        if (!dateDelivered)
            return

        const { review_notes: reviewNotes } = data;
        optimisticRequest.deliveredAt = dateDelivered.toISOString();

        if (reviewNotes)
            optimisticRequest.reviewedNotes = reviewNotes;

        const review = async () => {
            return triggerRequestReview({ dto: optimisticRequest })
                .then(res => {
                    const responseData: StockRequestWithOptionalExtras = res.data;
                    mutate(responseData);
                    onReview?.();
                    setOpen(false);
                })
                .catch((e) => {
                    console.error(e);
                    throw e;
                });
        };

        await toast.promise(
            review(),
            {
                loading: "Reviewing request...",
                success: "Successfully reviewed this request!",
                error(msg?: string) {
                    return msg ?? "There was an error reviewing this request!";
                }
            });
    }, [dateDelivered, mutate, onReview, optimisticRequest, setOpen, triggerRequestReview]);

    return (
        <GenericModal
            title="Confirm Review"
            isOpen={isOpen}
            isDismissable={false}
            onClose={() => setOpen(false)}
            classNames={{
                wrapper: "z-[202]",
                backdrop: "z-[201]"
            }}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                    <GenericDatePicker
                        isDisabled={isReviewing}
                        inputLabel="Date Delivered"
                        value={dateDelivered}
                        onDateChange={setDateDelivered}
                        isRequired
                    />
                    <GenericTextArea
                        isDisabled={isReviewing}
                        register={register}
                        id="review_notes"
                        label="Notes"
                        placeholder="Enter some notes here..."
                    />
                    <Divider className="my-6" />
                    <GenericCard>
                        <p>
                            <span className="font-semibold text-warning">⚠️ Are you sure you want to finish this review? ⚠️</span><br /><br />
                            Once you select <span
                                className="font-semibold text-primary">{"\"I'm sure\""}</span> you will no
                            longer be able to edit this
                            request!
                        </p>
                    </GenericCard>
                    <div className="flex gap-4">
                        <GenericButton
                            type="submit"
                            disabled={isReviewing}
                            isLoading={isReviewing}
                        >
                            {"I'm sure"}
                        </GenericButton>
                        <GenericButton
                            color="danger"
                            variant="flat"
                            disabled={isReviewing}
                            onPress={() => setOpen(false)}
                        >
                            Nevermind
                        </GenericButton>
                    </div>
                </div>

            </form>
        </GenericModal>
    );
};

export default ConfirmInventoryRequestReviewModal;