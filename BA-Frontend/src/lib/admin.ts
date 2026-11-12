import type { AdminUserResponse, UserAccount } from '@/types/admin';

export function mapAdminUser(user: AdminUserResponse): UserAccount {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phone_number,
    birthday: user.birthday.slice(0, 10),
    gender: user.gender,
    address: user.address,
    profileImage: user.profile_image_url,
    businessName: user.business?.business_name ?? null,
    businessType: user.business?.business_type ?? null,
    businessAddress: user.business?.business_address ?? null,
    businessDateStarted: user.business?.date_started?.slice(0, 10) ?? null,
    businessImage: user.business?.business_image_url ?? null,
    isBanned: user.is_banned,
  };
}
