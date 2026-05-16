import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export function useAdminAudit(isAdmin: boolean, activeTab: string) {
    const auditQuery = useQuery({
        queryKey: ['admin', 'audit'],
        enabled: isAdmin && activeTab === 'audit',
        queryFn: () => adminService.getAuditLog(),
    });

    return {
        auditLog: auditQuery.data ?? [],
        isLoading: auditQuery.isLoading
    };
}
