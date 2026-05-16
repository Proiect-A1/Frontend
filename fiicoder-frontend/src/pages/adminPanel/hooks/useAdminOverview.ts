import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export function useAdminOverview(isAdmin: boolean) {
    const overviewQuery = useQuery({
        queryKey: ['admin', 'overview'],
        enabled: isAdmin,
        queryFn: () => adminService.getOverview(),
    });

    return {
        overview: overviewQuery.data,
        isLoading: overviewQuery.isLoading
    };
}
