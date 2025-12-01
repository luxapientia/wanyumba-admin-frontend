import { Shield, AlertTriangle, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import Button from './Button.js';
import Modal from './Modal.js';

export interface ScamDetectionResult {
  isScam: boolean;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  riskFactors: Array<{
    factor: string;
    score: number;
    reasoning: string;
  }>;
  recommendation: 'approve' | 'review' | 'reject';
  timestamp: string;
  listingId?: string;
}

export interface ScamDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScamDetectionResult | null;
  loading?: boolean;
}

export default function ScamDetectionModal({
  isOpen,
  onClose,
  result,
  loading = false,
}: ScamDetectionModalProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          icon: <AlertTriangle className="text-red-600" size={20} />,
        };
      case 'high':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-300',
          icon: <AlertCircle className="text-orange-600" size={20} />,
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          icon: <Info className="text-yellow-600" size={20} />,
        };
      case 'low':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          icon: <CheckCircle className="text-green-600" size={20} />,
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          icon: <Info className="text-gray-600" size={20} />,
        };
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve':
        return 'bg-green-500 text-white';
      case 'review':
        return 'bg-yellow-500 text-white';
      case 'reject':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const footer = (
    <Button onClick={onClose} variant="outline" fullWidth>
      Close
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      maxHeight="max-h-[90vh]"
      footer={footer}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-lg">
          <Shield size={32} className="text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
            AI Scam Detection
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Analysis results for this property listing
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
          <p className="text-gray-600 text-lg">Analyzing property for scam indicators...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          {/* Overall Result */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {result.isScam ? (
                  <AlertTriangle size={32} className="text-red-600" />
                ) : (
                  <CheckCircle size={32} className="text-green-600" />
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {result.isScam ? 'Potential Scam Detected' : 'No Scam Detected'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Confidence: {formatConfidence(result.confidence)}
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-bold text-sm ${getRecommendationColor(
                  result.recommendation
                )}`}
              >
                {result.recommendation.toUpperCase()}
              </div>
            </div>

            {/* Risk Level */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">Risk Level:</span>
                <div
                  className={`px-3 py-1 rounded-lg flex items-center gap-2 ${getRiskLevelColor(result.riskLevel).bg} ${getRiskLevelColor(result.riskLevel).text} border ${getRiskLevelColor(result.riskLevel).border}`}
                >
                  {getRiskLevelColor(result.riskLevel).icon}
                  <span className="font-bold capitalize">{result.riskLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reasons */}
          {result.reasons && result.reasons.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                Key Findings
              </h4>
              <ul className="space-y-2">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed">{reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Factors */}
          {result.riskFactors && result.riskFactors.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-orange-600" />
                Detailed Risk Factors
              </h4>
              <div className="space-y-4">
                {result.riskFactors.map((factor, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{factor.factor || 'Unknown Risk Factor'}</h5>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                            style={{ width: `${(factor.score || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700 w-12 text-right">
                          {formatConfidence(factor.score || 0)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mt-2">
                      {factor.reasoning || 'No reasoning provided.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
            Analysis performed on {formatDate(result.timestamp)}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No analysis results available</p>
        </div>
      )}
    </Modal>
  );
}

