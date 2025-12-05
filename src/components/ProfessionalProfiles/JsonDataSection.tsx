import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface JsonDataSectionProps {
  title: string;
  icon: ReactNode;
  data: unknown;
  colorScheme?: 'indigo' | 'blue';
  delay?: number;
}

const renderJsonField = (data: unknown): ReactNode => {
  if (!data) return null;
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-2">
            {parsed.map((item: unknown, idx: number) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                {typeof item === 'object' && item !== null ? (
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                ) : (
                  <span className="text-sm text-gray-700">{String(item)}</span>
                )}
              </div>
            ))}
          </div>
        );
      }
      return <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(parsed, null, 2)}</pre>;
    }
    if (Array.isArray(data)) {
      return (
        <div className="space-y-2">
          {data.map((item: unknown, idx: number) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
              {typeof item === 'object' && item !== null ? (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(item, null, 2)}
                </pre>
              ) : (
                <span className="text-sm text-gray-700">{String(item)}</span>
              )}
            </div>
          ))}
        </div>
      );
    }
    if (typeof data === 'object' && data !== null) {
      return <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
    }
    return <span className="text-sm text-gray-700">{String(data)}</span>;
  } catch {
    return <span className="text-sm text-gray-700">{String(data)}</span>;
  }
};

export default function JsonDataSection({
  title,
  icon,
  data,
  colorScheme: _colorScheme = 'indigo',
  delay = 0.25,
}: JsonDataSectionProps) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="overflow-x-auto">{renderJsonField(data)}</div>
    </motion.div>
  );
}

