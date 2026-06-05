// Canonical group types shared between the classes and admin feature modules.
// Previously these were duplicated (GroupMemberDTO/GroupMemberSummary and
// GroupMembersResponseDTO/GroupMembersResponse were byte-identical); the feature
// services now alias these so existing import names keep working.

export interface GroupMember {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'USER' | 'ADMIN' | 'PROFESSOR';
    email: string;
}

export interface GroupMembersResponse {
    groupId: string;
    canManage: boolean;
    teacher: GroupMember;
    students: GroupMember[];
}

// Spring `Page<T>` shape returned by the paginated /group endpoint.
export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}
