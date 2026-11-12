export interface ProfileData {
  name: string;
  email: string;
  phoneNumber: string;
  birthday: string;
  address: string;
  profileImageUrl: string | null;
}

export interface BusinessProfileData {
  businessName: string;
  businessType: string;
  businessAddress: string;
  dateStarted: string;
  businessImageUrl: string | null;
}
