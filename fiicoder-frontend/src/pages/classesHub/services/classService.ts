import { apiClient } from "../../../services/apiClient";
import { buildQuery } from "../../../utils/queryString";

export interface GroupFindResponseDTO {
  id: string;
  name: string;
  description: string | null;
  memberCount?: number;
  creatorId: string;
  creatorUsername: string;
  createdAt: string;
  isCreator?: boolean | null;
}

export interface GroupCreateRequestDTO {
  name: string;
  description?: string;
  creatorId: string;
}

export interface GroupCreateResponseDTO {
  id: string;
}

export interface GroupUpdateRequestDTO {
  name?: string;
  description?: string;
}

export interface GroupUpdateResponseDTO {
  id: string;
}

export interface GroupInviteUserRequestDTO {
  email: string;
}

export interface GroupInvitationResponseDTO {
  id: string;
  status: string;
  sentAt: string;
  resolvedAt?: string | null;
  studyClass?: {
    id: string;
    name: string;
    description?: string | null;
    createdAt?: string;
    creator?: {
      id?: string;
      username?: string;
    };
  };
  invitedUser?: {
    id: string;
    username: string;
    email?: string;
  };
}

export interface GroupMembershipDTO {
  id: string;
  name: string;
  description: string | null;
  memberCount?: number;
  creatorId: string;
  creatorUsername: string;
  createdAt: string;
  isCreator: boolean;
}

export interface GroupMemberDTO {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'PROFESSOR';
  email: string;
}

export interface GroupMembersResponseDTO {
  groupId: string;
  canManage: boolean;
  teacher: GroupMemberDTO;
  students: GroupMemberDTO[];
}

// Spring Page<T> shape returned by the paginated /group endpoint.
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

export interface GroupSearchCriteria {
  search?: string;
  creatorId?: string;
  creatorUsername?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export const classService = {
  getMyGroups() {
    return apiClient.get<GroupMembershipDTO[]>('/group/me');
  },


  getById(groupId: string) {
    return apiClient.get<GroupFindResponseDTO>(`/group/${groupId}`);
  },

  create(request: GroupCreateRequestDTO) {
    return apiClient.post<GroupCreateResponseDTO>("/group", request);
  },

  update(groupId: string, request: GroupUpdateRequestDTO) {
    return apiClient.patch<GroupUpdateResponseDTO>(`/group/${groupId}`, request);
  },

  inviteUser(groupId: string, request: GroupInviteUserRequestDTO) {
    return apiClient.post<void>(`/group/${groupId}/invite`, request);
  },

  getMyInvitations() {
    return apiClient.get<GroupInvitationResponseDTO[]>("/group/invitations/me");
  },

  acceptInvitation(invitationId: string) {
    return apiClient.post<void>(`/group/invitations/${invitationId}/accept`);
  },

  declineInvitation(invitationId: string) {
    return apiClient.post<void>(`/group/invitations/${invitationId}/decline`);
  },

  deleteGroup(groupId: string) {
    return apiClient.delete<void>(`/group/${groupId}`);
  },

  getGroupInvitations(groupId: string) {
    return apiClient.get<GroupInvitationResponseDTO[]>(`/group/${groupId}/invitations`);
  },

  getGroupStudents(groupId: string) {
    return apiClient.get<GroupMembersResponseDTO>(`/group/${groupId}/students`);
  },

  removeGroupStudent(groupId: string, studentId: string) {
    return apiClient.delete<void>(`/group/${groupId}/students/${studentId}`);
  },

  searchGroups(
    criteria: GroupSearchCriteria,
    page: number = 1,
    size: number = 20,
    sort?: string,
  ) {
    const query = buildQuery({ page, size, sort, ...criteria });
    return apiClient.get<SpringPage<GroupFindResponseDTO>>(`/group${query}`);
  },

  removeGroupMemberAsAdmin(groupId: string, userId: string) {
    return apiClient.delete<void>(`/group/${groupId}/members/${userId}`);
  },
};
