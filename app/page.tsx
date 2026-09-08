import { Suspense } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import ProductGrid from '@/components/home/ProductGrid';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import InstagramSection from '@/components/home/InstagramSection';
import SkeletonCard from '@/components/ui/SkeletonCard';

function ProductGridFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

export default function HomePage({ searchParams }: { searchParams?: { slide?: string } }) {
  const initialSlide = searchParams?.slide ? parseInt(searchParams.slide, 10) : 0;
  return (
    <>
      <HeroBanner initialSlide={isNaN(initialSlide) ? 0 : initialSlide} />
      <Suspense fallback={<ProductGridFallback />}>
        <ProductGrid />
      </Suspense>
      <TestimonialsSection />
      <InstagramSection />
    </>
  );
}
