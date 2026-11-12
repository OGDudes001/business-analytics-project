interface HeroSectionProps {
  userName?: string;
  businessName?: string;
  bannerImage?: string;
}

export default function HeroSection({
  userName,
  businessName,
  bannerImage,
}: HeroSectionProps) {
  // Grab from localStorage if props are not explicitly provided
  const storedUser = localStorage.getItem('user');
  const storedBusiness = localStorage.getItem('business');

  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const parsedBusiness = storedBusiness ? JSON.parse(storedBusiness) : null;

  const finalUserName = userName || parsedUser?.name || "User";
  const finalBusinessName = businessName || parsedBusiness?.business_name || "My Business";

  // Format image path correctly for Laravel storage symlink
  let finalBannerImage = bannerImage;
  if (!finalBannerImage && parsedBusiness?.business_image) {
    // If it's stored as 'businesses/image.jpg', prepend the configured backend storage URL.
    const imgPath = parsedBusiness.business_image;
    finalBannerImage = imgPath.startsWith('http') 
      ? imgPath 
      : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/storage/${imgPath}`;
  }

  // Fallback default background if no image uploaded
  const bgImage = finalBannerImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80";

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden shadow-xl border border-gray-800 bg-gray-900">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-fixed bg-center transition-transform duration-500 hover:scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      {/* Hero Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 text-white">
        <p className="text-sm sm:text-base md:text-lg font-medium text-gray-200 drop-shadow-sm">
          Welcome Back {finalUserName},
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-white drop-shadow-md">
          {finalBusinessName}
        </h1>
      </div>
    </div>
  );
}