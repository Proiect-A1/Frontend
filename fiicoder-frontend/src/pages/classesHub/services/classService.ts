import { apiClient } from "../../../services/apiClient";

export interface GroupFindResponseDTO {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  creatorUsername: string;
  createdAt: string;
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

export const classService = {
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
};