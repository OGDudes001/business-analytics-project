import HeroSection from '@/components/dashboard/hero-section';
import Section1 from '@/components/dashboard/section1';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  const businessName = user?.business?.business_name;
  const businessImage = user?.business?.business_image
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/storage/${user.business.business_image}`
    : undefined;

  return (
    <>
      <HeroSection
        userName={user?.name}
        businessName={businessName}
        bannerImage={businessImage}
      />
      <Section1 />
    </>
  );
}