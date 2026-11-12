export interface UserAccount {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  birthday: string;
  gender: string;
  address: string;
  profileImage: string | null;
  businessName: string | null;
  businessType: string | null;
  businessAddress: string | null;
  businessDateStarted: string | null;
  businessImage: string | null;
  isBanned: boolean;
}

export interface AdminUserResponse {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  birthday: string;
  gender: string;
  address: string;
  profile_image_url: string | null;
  is_banned: boolean;
  business: {
    business_name: string;
    business_type: string;
    business_address: string;
    date_started: string;
    business_image_url: string | null;
  } | null;
}
