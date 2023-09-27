"use client";

import { Dispatch, FC, SetStateAction, useCallback } from "react";
import GenericTextArea from "../../../../../../_components/inputs/GenericTextArea";
import { Divider } from "@nextui-org/divider";
import GenericCard from "../../../../../../_components/GenericCard";
import GenericButton from "../../../../../../_components/inputs/GenericButton";
import GenericModal from "../../../../../../_components/GenericModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import useSWRMutation from "swr/mutation";
import { StockRequestWithOptionalExtras } from "../../../_components/requests/inventory-requests-utils";
import { toast } from "react-hot-toast";
import { KeyedMutator } from "swr";
import { ReviewInventoryRequestDto } from "../../../../../../api/inventory/requests/types";

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
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>
}

const ConfirmInventoryRequestReviewModal: FC<Props> = ({ id, optimisticRequest, mutate, isOpen, setOpen }) => {
    const { register, handleSubmit } = useForm();
    const { trigger: triggerRequestReview, isMutating: isReviewing } = ReviewRequest(id);

    const onSubmit: SubmitHandler<FieldValues> = useCallback(async (data) => {
        const { review_notes: reviewNotes } = data;
        if (reviewNotes)
            optimisticRequest.reviewedNotes = reviewNotes;

        const review = async () => {
            return triggerRequestReview({ dto: optimisticRequest })
                .then(res => {
                    const responseData: StockRequestWithOptionalExtras = res.data;
                    mutate(responseData);
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
    }, [mutate, optimisticRequest, setOpen, triggerRequestReview]);

    return (
        <GenericModal
            title="Confirm Review"
            isOpen={isOpen}
            isDismissable={!isReviewing}
            onClose={() => setOpen(false)}
            classNames={{
                wrapper: "z-[202]",
                backdrop: "z-[201]"
            }}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">
                    <GenericTextArea
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