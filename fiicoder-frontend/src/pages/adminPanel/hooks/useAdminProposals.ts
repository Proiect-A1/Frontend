import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { toast } from 'sonner';
import { useLanguage } from '../../../language/Language';
import { extractErrorMessage } from '../utils/errorUtils';

export function useAdminProposals(isAdmin: boolean, activeTab: string) {
    const { lang } = useLanguage();
    const queryClient = useQueryClient();
    const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

    const proposalsQuery = useQuery({
        queryKey: ['admin', 'proposals'],
        enabled: isAdmin && activeTab === 'proposals',
        queryFn: async () => {
            const data = await adminService.getProposals();
            return data.filter(
                (proposal) =>
                    proposal.status === 'PENDING' || (proposal.status as string) === 'pending',
            );
        },
        staleTime: 1000 * 60 * 5,
    });

    const proposals = proposalsQuery.data ?? [];

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
            const message = extractErrorMessage(
                error,
                lang === 'RO' ? 'Eroare la procesarea propunerii.' : 'Failed to process proposal.',
            );
            toast.error(message);
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
        isSelectedLoading: selectedProposalQuery.isLoading
    };
}
