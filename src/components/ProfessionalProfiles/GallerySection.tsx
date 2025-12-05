import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

interface GallerySectionProps {
  gallery?: string[];
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

export default function GallerySection({
  gallery,
  colorScheme = 'indigo',
  delay = 0.5,
}: GallerySectionProps) {
  const iconColor = colorScheme === 'indigo' ? 'text-indigo-600' : 'text-blue-600';

  if (!gallery || gallery.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ImageIcon size={20} className={iconColor} />
        Gallery
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gallery.map((imageUrl, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
            <img
              src={imageUrl}
              alt={`Gallery image ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onClick={() => window.open(imageUrl, '_blank')}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

