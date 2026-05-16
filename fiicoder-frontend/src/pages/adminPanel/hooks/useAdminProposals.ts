import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type ProblemProposal, type ProblemProposalDetail } from '../services/adminService';
import { mockProposals } from '../../proposeProblem/services/mockProposals';
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
            try {
                const data = await adminService.getProposals();
                return data.filter(
                    (proposal) =>
                        proposal.status === 'PENDING' || (proposal.status as string) === 'pending',
                );
            } catch {
                return mockProposals.map((proposal, index) => ({
                    id: `mock_${index}`,
                    title: proposal.title,
                    description: proposal.difficulty,
                    status: 'PENDING',
                    authorUsername: 'Mock Author',
                    createdAt: new Date().toISOString(),
                })) as unknown as ProblemProposal[];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const proposals = proposalsQuery.data ?? [];

    const selectedProposalQuery = useQuery({
        queryKey: ['admin', 'proposal', selectedProposalId],
        enabled: !!selectedProposalId,
        queryFn: () => adminService.getProblemProposal(selectedProposalId as string),
    });

    const selectedProposal = useMemo(() => {
        if (selectedProposalQuery.data) return selectedProposalQuery.data;

        if (!selectedProposalId) return null;

        if (selectedProposalQuery.isError) {
            const mockMatch = mockProposals.find(
                (p, idx) =>
                    p.title === selectedProposalId ||
                    `mock_${idx}` === selectedProposalId ||
                    `p${idx + 1}` === selectedProposalId,
            ) || mockProposals[0];

            if (mockMatch) {
                return {
                    id: selectedProposalId,
                    title: mockMatch.title,
                    authorUsername: 'Mock User',
                    description: mockMatch.statement.slice(0, 160),
                    status: 'PENDING',
                    createdAt: new Date().toISOString(),
                    statement: mockMatch.statement,
                    tags: mockMatch.tags,
                } as unknown as ProblemProposalDetail;
            }
        }
        return null;
    }, [selectedProposalQuery.data, selectedProposalQuery.isError, selectedProposalId]);

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
        isSelectedLoading: selectedProposalQuery.isLoading
    };
}
