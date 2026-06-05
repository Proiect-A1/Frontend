import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type AcceptedProblem } from '../services/adminService';
import { toast } from 'sonner';
import { useLanguage, translations } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';

export function useAdminProposals(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const queryClient = useQueryClient();
    const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

    const proposalsQuery = useQuery({
        queryKey: ['admin', 'proposals'],
        enabled: isAdmin && activeTab === 'problems',
        queryFn: async () => {
            const data = await adminService.getProposals();
            return data.filter((proposal) => {
                const s = (proposal.status as string).toUpperCase();
                return s === 'PENDING' || s === 'CHECKED';
            });
        },
        staleTime: 1000 * 60 * 5,
    });

    const acceptedQuery = useQuery({
        queryKey: ['admin', 'accepted-problems'],
        enabled: isAdmin && activeTab === 'problems',
        queryFn: () => adminService.getAcceptedProblems(),
        staleTime: 1000 * 60 * 5,
    });

    const proposals = proposalsQuery.data ?? [];
    const acceptedProblems = acceptedQuery.data ?? [];

    const selectedProposalQuery = useQuery({
        queryKey: ['admin', 'proposal', selectedProposalId],
        enabled: !!selectedProposalId,
        queryFn: () => adminService.getProblemProposal(selectedProposalId as string),
    });

    const selectedProposal = selectedProposalQuery.data ?? null;

    const handleDeleteProposal = async (proposalId: string) => {
        try {
            await adminService.deleteProblem(proposalId);
            toast.success(t.adminProposalDeleted);
            const remainingProposals = proposals.filter((p) => p.id !== proposalId);
            queryClient.setQueryData(['admin', 'proposals'], remainingProposals);
            if (selectedProposalId === proposalId) {
                setSelectedProposalId(remainingProposals[0]?.id ?? null);
            }
        } catch (error) {
            const message = extractErrorMessage(
                error,
                t.adminProposalDeleteError,
            );
            toast.error(message);
        }
    };

    const handleDeleteAccepted = async (title: string) => {
        try {
            await adminService.deleteProblem(title);
            toast.success(t.adminProblemDeleted);
            queryClient.setQueryData(['admin', 'accepted-problems'],
                acceptedProblems.filter((p: AcceptedProblem) => p.title !== title));
        } catch (error) {
            const message = extractErrorMessage(
                error,
                t.adminProblemDeleteError,
            );
            toast.error(message);
        }
    };

    const handleChangeVisibility = async (title: string, newVisibility: 'PUBLIC' | 'PRIVATE') => {
        try {
            await adminService.changeVisibility(title, newVisibility);
            toast.success(
                newVisibility === 'PUBLIC' ? t.adminProblemNowPublic : t.adminProblemNowPrivate,
            );
            queryClient.setQueryData(['admin', 'accepted-problems'],
                acceptedProblems.map((p: AcceptedProblem) =>
                    p.title === title ? { ...p, problemVisibility: newVisibility } : p
                ));
        } catch (error) {
            const message = extractErrorMessage(
                error,
                t.adminVisibilityError,
            );
            toast.error(message);
        }
    };

    const handleReviewProposal = async (proposalId: string, action: 'approve' | 'reject') => {
        try {
            await adminService.reviewProposal(proposalId, action);

            toast.success(
                action === 'approve' ? t.adminProposalApproved : t.adminProposalRejected,
            );
            await queryClient.invalidateQueries({ queryKey: ['admin'] });

            const remainingProposals = proposals.filter((p) => p.id !== proposalId);
            queryClient.setQueryData(['admin', 'proposals'], remainingProposals);

            if (selectedProposalId === proposalId) {
                setSelectedProposalId(remainingProposals[0]?.id ?? null);
            }
        } catch (error) {
            const status = (error as { status?: number } | null)?.status;
            const beMessage = extractErrorMessage(error, '');
            if (status === 409) {
                if (beMessage.toLowerCase().includes('same')) {
                    toast.error(t.adminProposalStatusSame);
                } else if (beMessage.toLowerCase().includes('pending')) {
                    toast.error(t.adminProposalStatusNoPending);
                } else {
                    toast.error(beMessage || t.adminProposalStatusNotAllowed);
                }
                return;
            }
            toast.error(beMessage || t.adminProposalProcessError);
        }
    };

    return {
        proposals,
        isLoading: proposalsQuery.isLoading,
        selectedProposal,
        selectedProposalId,
        setSelectedProposalId,
        handleReviewProposal,
        handleDeleteProposal,
        isSelectedLoading: selectedProposalQuery.isLoading,
        acceptedProblems,
        isAcceptedLoading: acceptedQuery.isLoading,
        handleDeleteAccepted,
        handleChangeVisibility,
    };
}
