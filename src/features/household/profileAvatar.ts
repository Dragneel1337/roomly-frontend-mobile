import type { MemberAvatarSource } from "@/src/features/household/MemberAvatarStack";
import type { ProfileListResource } from "@/src/features/household/householdResourcesApi";

export function profileToAvatarSource(member: ProfileListResource): MemberAvatarSource {
  return {
    profileId: member.profileId,
    avatarName: member.avatar.name,
    colorName: member.avatar.colorName,
  };
}
