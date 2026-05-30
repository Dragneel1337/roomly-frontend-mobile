import { gql, type TypedDocumentNode } from "@apollo/client";

export type AvatarColor = {
  name: string;
  hex: string;
};

export type AvailableAvatarsAndColorsResult = {
  availableAvatarsAndColors: {
    avatars: (string | null)[];
    colors: AvatarColor[];
  };
};

export const AVAILABLE_AVATARS_AND_COLORS: TypedDocumentNode<AvailableAvatarsAndColorsResult> = gql`
  query AvailableAvatarsAndColors {
    availableAvatarsAndColors {
      avatars
      colors {
        name
        hex
      }
    }
  }
`;

export type HouseholdByJoinCodeResult = {
  householdByJoinCode: {
    id: string;
    name: string;
    membersCount: number;
    membersLimit: number;
  };
};

export const HOUSEHOLD_BY_JOIN_CODE: TypedDocumentNode<
  HouseholdByJoinCodeResult,
  { joinCode: string }
> = gql`
  query HouseholdByJoinCode($joinCode: String!) {
    householdByJoinCode(joinCode: $joinCode) {
      id
      name
      membersCount
      membersLimit
    }
  }
`;

export type CreateHouseholdVars = {
  name: string;
  membersLimit: number;
  nickname: string;
  avatarName: string;
  avatarColorName: string;
};

export type CreateHouseholdResult = {
  createHousehold: {
    id: string;
    name: string;
    joinCode: string;
  };
};

export const CREATE_HOUSEHOLD: TypedDocumentNode<CreateHouseholdResult, CreateHouseholdVars> = gql`
  mutation CreateHousehold(
    $name: String!
    $membersLimit: Int!
    $nickname: String!
    $avatarName: String!
    $avatarColorName: String!
  ) {
    createHousehold(
      name: $name
      membersLimit: $membersLimit
      nickname: $nickname
      avatarName: $avatarName
      avatarColorName: $avatarColorName
    ) {
      id
      name
      joinCode
    }
  }
`;

export type JoinHouseholdVars = {
  nickname: string;
  avatarName: string;
  avatarColorName: string;
  joinCode: string;
};

export type JoinHouseholdResult = {
  joinHousehold: {
    id: string;
    nickname: string;
  };
};

export const JOIN_HOUSEHOLD: TypedDocumentNode<JoinHouseholdResult, JoinHouseholdVars> = gql`
  mutation JoinHousehold(
    $nickname: String!
    $avatarName: String!
    $avatarColorName: String!
    $joinCode: String!
  ) {
    joinHousehold(
      nickname: $nickname
      avatarName: $avatarName
      avatarColorName: $avatarColorName
      joinCode: $joinCode
    ) {
      id
      nickname
    }
  }
`;
