'use client';

import { useState, useEffect } from 'react';
import type { ScoringCriteria, StartupLead } from '@/lib/spa-types';
import { STAGE_SCORES, ACTIVITY_SCORES, SCORE_OPTIONS } from '@/lib/spa-types';

interface ScoringPanelProps {
  lead: StartupLead;
  onScore: (criteria: ScoringCriteria) => void;
  isLoading?: boolean;
}

export default function ScoringPanel({ lead, onScore, isLoading = false }: ScoringPanelProps) {
  const [criteria, setCriteria] = useState<ScoringCriteria>({
    domainScore: 50,
    engagementScore: 50,
    storyPotentialScore: 50,
  });

  // Calculate automatic scores
  const stageScore = STAGE_SCORES[lead.startupStage];
  const activityScore = ACTIVITY_SCORES[lead.activityLevel];

  // Calculate weighted total
  const calculateTotal = () => {
    return (
      stageScore * 0.3 +
      activityScore * 0.2 +
      criteria.domainScore * 0.2 +
      criteria.engagementScore * 0.2 +
      criteria.storyPotentialScore * 0.1
    );
  };

  const weightedTotal = calculateTotal();
  const isQualified = weightedTotal >= 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScore(criteria);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Lead Scoring</h2>

      {/* Automatic Scores (Read-only) */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Automatic Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stage Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Stage of Startup</span>
              <span className="text-sm font-semibold text-gray-900">
                {stageScore} <span className="text-gray-400">/ 100</span>
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">{lead.startupStage} • Weight: 30%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stageScore}%` }}
              />
            </div>
          </div>

          {/* Activity Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Activity Level</span>
              <span className="text-sm font-semibold text-gray-900">
                {activityScore} <span className="text-gray-400">/ 100</span>
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">{lead.activityLevel} • Weight: 20%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${activityScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Scores */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Manual Scoring</h3>
        <div className="space-y-4">
          {/* Domain Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain Alignment (Weight: 20%)
            </label>
            <select
              value={criteria.domainScore}
              onChange={(e) =>
                setCriteria({ ...criteria, domainScore: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {SCORE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${criteria.domainScore}%` }}
              />
            </div>
          </div>

          {/* Engagement Potential */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Engagement Potential (Weight: 20%)
            </label>
            <select
              value={criteria.engagementScore}
              onChange={(e) =>
                setCriteria({ ...criteria, engagementScore: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {SCORE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${criteria.engagementScore}%` }}
              />
            </div>
          </div>

          {/* Story Potential */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story Potential (Weight: 10%)
            </label>
            <select
              value={criteria.storyPotentialScore}
              onChange={(e) =>
                setCriteria({ ...criteria, storyPotentialScore: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {SCORE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${criteria.storyPotentialScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weighted Total */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-semibold text-gray-900">Weighted Total Score</span>
          <span className="text-3xl font-bold text-gray-900">
            {weightedTotal.toFixed(1)}
            <span className="text-lg text-gray-500">/100</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
          <div
            className={`h-4 rounded-full transition-all ${
              isQualified ? 'bg-green-600' : 'bg-yellow-600'
            }`}
            style={{ width: `${weightedTotal}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div
            className={`text-sm font-semibold px-3 py-1 rounded-full ${
              isQualified
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {isQualified ? '✓ Qualified (≥50)' : '⚠ Not Qualified (<50)'}
          </div>
          {isQualified && (
            <div className="text-sm text-green-700 font-medium">
              +30 credits on submit
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
      >
        {isLoading ? 'Scoring...' : 'Submit Score & Mark as Verified'}
      </button>
    </form>
  );
}
