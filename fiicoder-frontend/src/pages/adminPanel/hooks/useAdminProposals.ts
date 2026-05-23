import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type AcceptedProblem } from '../services/adminService';
import { toast } from 'sonner';
import { useLanguage } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';

export function useAdminProposals(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const queryClient = useQueryClient();
    const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

    const proposalsQuery = useQuery({
        queryKey: ['admin', 'proposals'],
        enabled: isAdmin && activeTab === 'problems',
        queryFn: async () => {
            const data = await adminService.getProposals();
            return data.filter(
                (proposal) =>
                    proposal.status === 'PENDING' || (proposal.status as string) === 'pending',
            );
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
            toast.success(lang === 'RO' ? 'Propunerea a fost ștearsă.' : 'Proposal deleted.');
            const remainingProposals = proposals.filter((p) => p.id !== proposalId);
            queryClient.setQueryData(['admin', 'proposals'], remainingProposals);
            if (selectedProposalId === proposalId) {
                setSelectedProposalId(remainingProposals[0]?.id ?? null);
            }
        } catch (error) {
            const message = extractErrorMessage(
                error,
                lang === 'RO' ? 'Eroare la ștergerea propunerii.' : 'Failed to delete proposal.',
            );
            toast.error(message);
        }
    };

    const handleDeleteAccepted = async (title: string) => {
        try {
            await adminService.deleteProblem(title);
            toast.success(lang === 'RO' ? 'Problema a fost ștearsă.' : 'Problem deleted.');
            queryClient.setQueryData(['admin', 'accepted-problems'],
                acceptedProblems.filter((p: AcceptedProblem) => p.title !== title));
        } catch (error) {
            const message = extractErrorMessage(
                error,
                lang === 'RO' ? 'Eroare la ștergerea problemei.' : 'Failed to delete problem.',
            );
            toast.error(message);
        }
    };

    const handleChangeVisibility = async (title: string, newVisibility: 'PUBLIC' | 'PRIVATE') => {
        try {
            await adminService.changeVisibility(title, newVisibility);
            toast.success(
                newVisibility === 'PUBLIC'
                    ? lang === 'RO' ? 'Problema este acum publică.' : 'Problem is now public.'
                    : lang === 'RO' ? 'Problema este acum privată.' : 'Problem is now private.',
            );
            queryClient.setQueryData(['admin', 'accepted-problems'],
                acceptedProblems.map((p: AcceptedProblem) =>
                    p.title === title ? { ...p, problemVisibility: newVisibility } : p
                ));
        } catch (error) {
            const message = extractErrorMessage(
                error,
                lang === 'RO' ? 'Eroare la schimbarea vizibilității.' : 'Failed to change visibility.',
            );
            toast.error(message);
        }
    };

    const handleReviewProposal = async (proposalId: string, action: 'approve' | 'reject') => {
        try {
            await adminService.reviewProposal(proposalId, action);

            toast.success(
                action === 'approve'
                    ? lang === 'RO' ? 'Propunerea a fost aprobată.' : 'Proposal approved.'
                    : lang === 'RO' ? 'Propunerea a fost respinsă.' : 'Proposal rejected.',
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
                    toast.error(
                        lang === 'RO'
                            ? 'Problema este deja în acest status.'
                            : 'Problem is already in this status.',
                    );
                } else if (beMessage.toLowerCase().includes('pending')) {
                    toast.error(
                        lang === 'RO'
                            ? 'Nu poți seta statusul înapoi la PENDING.'
                            : 'Cannot change status back to PENDING.',
                    );
                } else {
                    toast.error(
                        beMessage ||
                            (lang === 'RO'
                                ? 'Schimbarea statusului nu este permisă.'
                                : 'Status change not allowed.'),
                    );
                }
                return;
            }
            toast.error(
                beMessage ||
                    (lang === 'RO'
                        ? 'Eroare la procesarea propunerii.'
                        : 'Failed to process proposal.'),
            );
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
